// Create base object using ImmutableJS
const store = Immutable.Map({
    apod: '',
    rovers: Immutable.List(['','Curiosity', 'Opportunity', 'Spirit'])
});

// Add link to the DOM
const root = document.getElementById('root');

/**    
* @description Merge data from JSON response to main object and call render Function
* @param {object} state main object 
* @param {object} fromNASA data from JSON response
*/  
const modifyState = (state, fromNASA) => {
    const newState = state.merge(fromNASA);  // Merge together data from NASA API response to(in) newState
    // Call render Function with app function as argument and choice what argument will be in app Function - imageOfTheDay or latestRoverPhotos Fucntion
    if(newState.toJS().apod!=='') {
        render(root, app(imageOfTheDay(newState.toJS().apod,newState),newState));  
    }
    if (newState.toJS().rovers[0]!=='') {
        render(root, app(latestRoverPhotos('',newState),newState));  
    }
};

/**    
* @description Put data to DOM
* @param {link} root link to the DOM
* @param {string} htmlCode html code for the DOM
*/ 
const render = async (root, htmlCode) => {
    root.innerHTML = htmlCode;
};


/**    
* @description Create content for DOM
* @param {string} htmlCode part of HTML code
* @param {object} state main object
* @returns {string} HTML code for DOM
*/ 
const app = (htmlCode,state) => {
    let { rovers, apod } = state.toJS();
    // If there is something in apod key - it is true
    if (apod!=='') {
    return `<h1>PHOTO OF THE DAY</h1>
            <div>
            ${htmlCode}
            </div>`
    }
    // If there is something in rovers key - it is true
    if (rovers[0]!=='') {
        return `<div class = 'roverInfo'>
                    <li>Date of latest photos: ${state.toJS().rovers[0].earth_date}</li>
                    <li>Launch date: ${state.toJS().rovers[0].rover.launch_date}</li>
                    <li>Landing date: ${state.toJS().rovers[0].rover.landing_date}</li>
                    <li>Status: ${state.toJS().rovers[0].rover.status}</li>
                </div>
                <div class = "roverLatestPhotos">${htmlCode}</div>` 
    }
}

// ------------------------------------------------------  COMPONENTS

/**    
* @description Render content for DOM from NASA JSON response with photo of the day or call getImageOfTheDay Function
* @param {string,object} apod empty or response from NASA JSON with photo of the day
* @param {object} state main object
* @returns {string} HTML code for DOM
*/ 
const imageOfTheDay = (apod, state) => {
    // Call getImageOfTheDay if apod is empty
    if (!apod) {
        getImageOfTheDay(state);
    }

    // Return HTML code depending on content type - video or photo
    else if (apod.image.media_type === 'video') {
        return `
            <p>See video <a href='${apod.image.url}'>here</a></p>
            <p>${apod.image.title}</p>
            <p>${apod.image.explanation}</p>`;
    } else {
        return `
            <img class ='roverLatestPhoto' src='${apod.image.url}' width='100%' />
            <p class = 'apodExplanation'>${apod.image.explanation}</p>
        `;
    }
}

/**    
* @description Render content for DOM from NASA JSON response with latest photos from rover or call getLatestPhotos Function
* @param {string} rover name of the rover
* @param {object} state main object
* @returns {string} HTML code for DOM
*/ 
const latestRoverPhotos = (rover, state) => {
    // Call getLatestPhotos if first element in array rover is empty
    if (!state.toJS().rovers[0]) {
        getLatestPhotos(rover,state);
    } else {

    // Return HTML code
        // Using .map to create html content for each photo from rover
        const roverPhotosHTML = state.toJS().rovers.map (value => {
                return `<div>
                        <img class = 'roverLatestPhoto' src='${value.img_src}' alt='Rover's photo' width='100%'>
                        <div>${value.camera.full_name}</div>
                        </div>`
        }).join('');
        return roverPhotosHTML;
    }
}

// ------------------------------------------------------  API CALLS

/**    
* @description API call to image of the day and call modifyState Function
* @param {object} state main object
*/ 
const getImageOfTheDay = (state) => {
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => modifyState(state, { apod }))
};

async function getImageOfTheDay1 (state) {
    return await fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod =>  {console.log (JSON.stringify(apod)); return JSON.stringify (apod)})
        
    };

    const getImageOfTheDay2 = (state) => {
        return fetch(`http://localhost:3000/apod`)
            .then(res => res.json())
            .then(apod => {console.log (apod); return { apod }})
    };

/**    
* @description API call to latest photos and call modifyState Function
* @param {string} rover name of the rover
* @param {object} state main object
*/ 
const getLatestPhotos = (rover,state) => {
    fetch(`http://localhost:3000/latestPhotos/${rover}`)
        .then(res => res.json())
        .then(currentRover => {
            const rovers = currentRover.latest_photos;
            modifyState(state, {rovers})})
}

/**    
* @description IIFE with event listeners to buttons click
*/ 
(function clickToButtons () {
    document.querySelector('#buttons').addEventListener('click',(event) => {
        // Check that click to button and remove btnActive class from buttons
        if (event.target.matches('button, button *')) {
            document.querySelectorAll('.btn').forEach((element) => {
            element.classList.remove('btnActive');
            })
            // Check if button is bonus, set btnActive class for button, hide start info and call imageOfTheDay Function
            if (event.target.value === 'bonus') {
                document.querySelector('#startInfo').style.display = 'none';
                document.querySelector (`#${event.target.id}`).classList.add ('btnActive');
                imageOfTheDay (store.toJS().apod,store);

            // Check if button is rover, set btnActive class for button, hide start info and call latestRoverPhotos Function
            } else {
                document.querySelector('#startInfo').style.display = 'none';
                document.querySelector (`#${event.target.id}`).classList.add ('btnActive');
                latestRoverPhotos(event.target.value,store);
            }
        }
    });
})();





