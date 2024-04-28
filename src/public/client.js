//Create base object using ImmutableJS
const store = Immutable.Map({
    apod: '',
    rovers: Immutable.List(['','Curiosity', 'Opportunity', 'Spirit'])
});

//Add link to the DOM
const root = document.getElementById('root');

/**    
* @description Merge data from JSON response to main object and call render Function
* @param {object} state main object 
* @param {object} fromNASA data from JSON response
*/  
const modifyState = (state, fromNASA) => {
    //console.log ('From NASA',fromNASA);
    const newState = state.merge(fromNASA);  //merge together data from NASA API response to(in) newState
    //console.log ('NewState',newState.toJS());
    //call render Function with app function as argument and choice what argument will be in app Function - imageOfTheDay or latestRoverPhotos Fucntion
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
    //If there is something in apod key - it is true
    if (apod!=='') {
        //console.log('Apod before html',apod);
    return `<h1>PHOTO OF THE DAY</h1>
            <div>
            ${htmlCode}
            </div>`
    }
    //If there is something in rovers key - it is true
    if (rovers[0]!=='') {
        //console.log ('there is smth in Rovers')
        return `<div class = 'roverInfo'>
                    <li>Date of latest photos: ${state.toJS().rovers[0].earth_date}</li>
                    <li>Launch date: ${state.toJS().rovers[0].rover.launch_date}</li>
                    <li>Landing date: ${state.toJS().rovers[0].rover.landing_date}</li>
                    <li>Status: ${state.toJS().rovers[0].rover.status}</li>
                </div>
                <div class = "roverLatestPhotos">${htmlCode}</div>` 
    }
}

// listening for load event because page should load before any JS is called
/*window.addEventListener('load', () => {
    render(root, store)
})*/

// ------------------------------------------------------  COMPONENTS

/**    
* @description Render content for DOM from NASA JSON response with photo of the day or call getImageOfTheDay Function
* @param {string,object} apod empty or response from NASA JSON with photo of the day
* @param {object} state main object
* @returns {string} HTML code for DOM
*/ 
const imageOfTheDay = (apod, state) => {
    //call getImageOfTheDay if apod is empty
    if (!apod) {
        getImageOfTheDay(state);
    }

    //return HTML code depending on content type - video or photo
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
    //call getLatestPhotos if first element in array rover is empty
    if (!state.toJS().rovers[0]) {
        getLatestPhotos(rover,state);
    } else {

    //return HTML code
        //console.log ('Before rendering of the rover',state.toJS().rovers);
        //using .map to create html content for each photo from rover
        const roverPhotosHTML = state.toJS().rovers.map (value => {
                return `<div>
                        <img class = 'roverLatestPhoto' src='${value.img_src}' alt='Rover's photo' width='100%'>
                        <div>${value.camera.full_name}</div>
                        </div>`
        }).join('');
        return roverPhotosHTML;
    }
}

/******** check API latestRoverPhotos */
        /* in console:
        latestRoverPhotos ('Curiosity',store);
        */

// ------------------------------------------------------  API CALLS

/**    
* @description API call to image of the day and call modifyState Function
* @param {object} state main object
*/ 
const getImageOfTheDay = (state) => {
    //const { apod } = state.toJS();
    fetch(`http://localhost:3000/apod`)
    // fetch(`https://marsrovers-fenixcoderx.vercel.app/apod`)
        .then(res => res.json())
        .then(apod => modifyState(state, { apod }))
};

async function getImageOfTheDay1 (state) {
    //const { apod } = state.toJS();
    return await fetch(`http://localhost:3000/apod`)
    // return await fetch(`https://marsrovers-fenixcoderx.vercel.app/apod`)
        .then(res => res.json())
        .then(apod =>  {console.log (JSON.stringify(apod)); return JSON.stringify (apod)})
        
    };
/*
let bbb = await getImageOfTheDay1 (store);
*/

    const getImageOfTheDay2 = (state) => {
        //const { apod } = state.toJS();
        return fetch(`http://localhost:3000/apod`)
        // return fetch(`https://marsrovers-fenixcoderx.vercel.app/apod`)
            .then(res => res.json())
            .then(apod => {console.log (apod); return { apod }})
    };

//let bbb = await getImageOfTheDay2 (store);

/**    
* @description API call to latest photos and call modifyState Function
* @param {string} rover name of the rover
* @param {object} state main object
*/ 
const getLatestPhotos = (rover,state) => {
    //const selectedRover = state.toJS().rovers[0];
    fetch(`http://localhost:3000/latestPhotos/${rover}`)
    // fetch(`https://marsrovers-fenixcoderx.vercel.app/latestPhotos/${rover}`)
        .then(res => res.json())
        .then(currentRover => {
            //console.log (currentRover); 
            const rovers = currentRover.latest_photos;
            modifyState(state, {rovers})})
}

/******** check API getLatestPhotos */
        /* in console:
        getLatestPhotos ('Curiosity',store);
        */

/**    
* @description IIFE with event listeners to buttons click
*/ 
(function clickToButtons () {
    document.querySelector('#buttons').addEventListener('click',(event) => {
        //check that click to button and remove btnActive class from buttons
        if (event.target.matches('button, button *')) {
            document.querySelectorAll('.btn').forEach((element) => {
            element.classList.remove('btnActive');
            })
            //check if button is bonus, set btnActive class for button, hide start info and call imageOfTheDay Function
            if (event.target.value === 'bonus') {
                //console.log ('it is APOD');
                //console.log (event.target.value);
                document.querySelector('#startInfo').style.display = 'none';
                document.querySelector (`#${event.target.id}`).classList.add ('btnActive');
                imageOfTheDay (store.toJS().apod,store);

            //check if button is rover, set btnActive class for button, hide start info and call latestRoverPhotos Function
            } else {
                //console.log ('this is ROVER');
                //console.log (event.target.value);
                //console.log (event.target.id);
                document.querySelector('#startInfo').style.display = 'none';
                document.querySelector (`#${event.target.id}`).classList.add ('btnActive');
                latestRoverPhotos(event.target.value,store);
            }
        }
    });
})();





