const arrowLeft = '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-big-left-line"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 15v3.586a1 1 0 0 1 -1.707 .707l-6.586 -6.586a1 1 0 0 1 0 -1.414l6.586 -6.586a1 1 0 0 1 1.707 .707v3.586h6v6h-6z" /><path d="M21 15v-6" /></svg>';
const arrowRight = '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-big-right-line"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v-3.586a1 1 0 0 1 1.707 -.707l6.586 6.586a1 1 0 0 1 0 1.414l-6.586 6.586a1 1 0 0 1 -1.707 -.707v-3.586h-6v-6h6z" /><path d="M3 9v6" /></svg>';

const sidebarButton = document.getElementById('buttonAsside');
const list = document.getElementById('ripsMenu');
const openSelected = document.getElementById('openSlide');
const deleteSelected = document.getElementById('deleteElement');

(async () => {
    try {
        const elementsList = localStorage.getItem('elementsList');
        const list = JSON.parse(elementsList);
        createElementList(list);
    } catch (error) {
        console.error('Error geting rips from localStorage:', error);
    
    }
    try {
        const response = await fetch('https://max-fernandez-utec.github.io/2024/rip/rips');
        const rip = await response.json();
        localStorage.setItem('elementsList', JSON.stringify(rip));
        console.log("entro");
        createElementList(rip);
    } catch (error) {
        window.alert('Error al cargar los RIPs desde la api');
        console.error('Error geting rips:', error);
    }

})();

function createElementList(listObject) {
    const html = listObject.map(item => `
        <li aside="elements" data-id="${item.id}">
            ${item.name}
        </li>
    `).join('');
    const ripContainer = document.getElementById('ripsMenu');
    ripContainer.innerHTML = html;
}

const fetchAndDisplayDiapos = async (id) => {
    const diaposStorage = localStorage.getItem(id);
    if (diaposStorage) {
        const diaposJson = JSON.parse(diaposStorage);
        createAndDeploySlidesElements(diaposJson);
        console.log('Loaded from JSON');
    } else {
        try {
            const res = await fetch(`https://max-fernandez-utec.github.io/2024/rip/rips/${id}`);
            const diapos = await res.json();
            localStorage.setItem(id, JSON.stringify(diapos));
            createAndDeploySlidesElements(diapos);
        } catch (error) {
            window.alert('Error loading diapos from the API');
            console.error('Error getting diapos:', error);
        }
    }
};

const deleteSlide = (id) => {
    const elementsList = localStorage.getItem('elementsList');
    const elements = JSON.parse(elementsList);
    elements.pop(id)
    localStorage.setItem('elementsList', JSON.stringify(elements));
    localStorage.removeItem(id);

    createElementList(elements);
};

function createAndDeploySlidesElements(list) {
    let slideId = 0;
    const html = list.map(diapo => {
        let title = diapo.title ? `<h2>${diapo.title}</h2>` : "";
        let section;
        let result;
        let diapoContent;
        let url;
        switch (diapo.type) {
            case "titulo":
                section = `<section diapo="${diapo.type}">${title}</section>`;
                break;
            case "simple":
                section = `${title}<section diapo="${diapo.type}"><p>${diapo.content}</p></section>`;
                break;
            case "imagen":
                result = diapo.content.indexOf('URL');
                diapoContent = diapo.content;
                if (result === 0) {
                    section = `${title}<section diapo="${diapo.type}"><img src="${diapo.content}" alt="img"></section>`;
                    break;
                }
                url = diapoContent.replace(new RegExp('URL', 'g'), 'max-fernandez-utec.github.io/2024/rip');
                section = `${title}<section diapo="${diapo.type}"><img src="${url}" alt="img"></section>`;
                break;
            case "video":
                result = diapo.content.indexOf('URL');
                diapoContent = diapo.content;
                if (result === 0) {
                    section = `${title}<section diapo="${diapo.type}"><video src="${diapo.content}" autoplay controls>
                    <p>Your browser doesn't support HTML5 video</p></video></section>`;
                    console.log(diapo.content);
                    break;
                }
                url = diapoContent.replace(new RegExp('URL', 'g'), 'max-fernandez-utec.github.io/2024/rip');
                section = `${title}<section diapo="${diapo.type}"><video src="${url}" autoplay controls>
                <p>Your browser doesn't support HTML5 video</p></video></section>`;
                break;
            default:
                section = "";
                break;
        }

        slideId++;
        return `<article id="${slideId}" ${slideId !== 1 ? 'diapo="hidden"' : ''}>${section}</article>`;
    }).join('');

    const nav = `
                <nav>
                    <button id="backButton" onclick="back()" disabled> ${arrowLeft} </button>
                    <span id="currentSlide">1/${slideId}</span>
                    <button id="nextButton" onclick="next()"> ${arrowRight} </button>
                </nav>
            `;

    const slideContainer = document.getElementById('main');
    slideContainer.innerHTML = html + nav;

    // Desmarcar elementos de la lista
    const listItems = document.querySelectorAll('#ripsMenu .clicked');
    listItems.forEach(item => item.classList.remove('clicked'));

}

function next() {
    const buttonBack = document.getElementById('backButton');
    const buttonNext = document.getElementById('nextButton');
    const elementsList = document.querySelectorAll('#main article');
    const elementLength = elementsList.length;

    let currentItemIndex = -1;

    for (let i = 0; i < elementLength; i++) {
        if (!elementsList[i].hasAttribute('diapo') ||
            elementsList[i].getAttribute('diapo') !== 'hidden') {
            currentItemIndex = i;
            break;
        }
    }

    const currentItem = elementsList[currentItemIndex];
    const nextItem = elementsList[currentItemIndex + 1];

    if (currentItemIndex === -1 || currentItemIndex >= elementLength - 1) return;

    currentItem.setAttribute('diapo', 'hidden');
    nextItem.removeAttribute('diapo', 'hidden');

    document.getElementById('currentSlide').innerHTML = `<span id="currentSlide">${currentItemIndex + 2}/${elementLength}</span>`;

    buttonBack.removeAttribute('disabled');

    if (currentItemIndex + 1 === elementLength - 1) {
        buttonNext.setAttribute('disabled', true);
    }

    currentActivity();
}

function back() {
    const buttonNext = document.getElementById('nextButton');
    const buttonBack = document.getElementById('backButton');
    const elementsList = document.querySelectorAll('#main article');
    const elementLength = elementsList.length;

    let currentItemIndex = -1;

    for (let i = 0; i < elementLength; i++) {
        if (!elementsList[i].hasAttribute('diapo') || elementsList[i].getAttribute('diapo') !== 'hidden') {
            currentItemIndex = i;
            break;
        }
    }

    if (currentItemIndex <= 0) return;

    const currentItem = elementsList[currentItemIndex];
    const previousItem = elementsList[currentItemIndex - 1];

    currentItem.setAttribute('diapo', 'hidden');
    previousItem.removeAttribute('diapo', 'hidden');

    document.getElementById('currentSlide').innerHTML = `<span id="currentSlide">${currentItemIndex}/${elementLength}</span>`;

    buttonNext.removeAttribute('disabled');

    if (currentItemIndex - 1 === 0) {
        buttonBack.setAttribute('disabled', true);
    }
    currentActivity();
}

function currentActivity() {
    const main = document.getElementById('main');
    const currentHTML = main.innerHTML;
    localStorage.setItem('currentActivity', JSON.stringify(currentHTML));
}

function alertOpen() {
    const alert = document.getElementById('uploadAlert');
    alert.classList.toggle('AlertClose');
}

function loadJSONFile(event) {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {

        const jsonNameWithJson = file.name;
        const jsonName = jsonNameWithJson.replace(new RegExp('.json', 'g'), '');

        const formData = {
            name: jsonName,
            id: jsonName
        }
        const elementsList = localStorage.getItem('elementsList');
        const list = JSON.parse(elementsList);
        for (let i = 0; i < list.length; i++) {
            if (formData.id === list[i].id) {
                alert('Este json ya esta en nuestra base de datos.');
                return;
            }
        }
        list.push(formData)
        localStorage.setItem('elementsList', JSON.stringify(list));

        createElementList(list);
        const jsonRead = new FileReader();

        jsonRead.onload = (e) => {
            const jsonContent = e.target.result;
            const jsonObject = JSON.parse(jsonContent);
            localStorage.setItem(formData.id, JSON.stringify(jsonObject));
            alert('Archivo subido con exito.');
            alertOpen();
        };
        jsonRead.readAsText(file);
    } else {
        alert('Porfavor seleccione un archivo json.');
    }
}
list.addEventListener('click', (event) => {
    const element = event.target;
    element.classList.toggle('clicked');
    const id = element.getAttribute('data-id');

    openSelected.onclick = () => fetchAndDisplayDiapos(id);

    deleteSelected.onclick = () => deleteSlide(id);
});

sidebarButton.addEventListener('click', () => {
    const aside = document.getElementById('aside');
    const main = document.getElementById('main');

    const action = sidebarButton.getAttribute('buttonAsside');
    if (action === 'isOpen') {
        aside.setAttribute('aside', 'close');
        main.setAttribute('main', '100');
        sidebarButton.setAttribute('buttonAsside', 'isClosed');
        sidebarButton.innerHTML = '<svg  xmlns="<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-arrows-minimize"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 9l4 0l0 -4" /><path d="M3 3l6 6" /><path d="M5 15l4 0l0 4" /><path d="M3 21l6 -6" /><path d="M19 9l-4 0l0 -4" /><path d="M15 9l6 -6" /><path d="M19 15l-4 0l0 4" /><path d="M15 15l6 6" /></svg>'
    } else {
        aside.setAttribute('aside', 'open');
        main.setAttribute('main', '80');
        sidebarButton.setAttribute('buttonAsside', 'isOpen');
        sidebarButton.innerHTML = '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-arrows-maximize"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 4l4 0l0 4" /><path d="M14 10l6 -6" /><path d="M8 20l-4 0l0 -4" /><path d="M4 20l6 -6" /><path d="M16 20l4 0l0 -4" /><path d="M14 14l6 6" /><path d="M8 4l-4 0l0 4" /><path d="M4 4l6 6" /></svg>'
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const lastActivity = JSON.parse(localStorage.getItem('currentActivity'));
    if (lastActivity) {
        document.getElementById('main').innerHTML = lastActivity;
    }
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
        back();
    } else if (event.key === 'ArrowRight') {
        next();
    }
});