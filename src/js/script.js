
const closePopUp = document.getElementById('pop-up_close');
const popUp = document.getElementById('pop-up');
const popUpContent = document.querySelector('.soccer__pop iframe');
const popUpTriggers = document.querySelectorAll('.pop-up_trigger');

popUpTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
        e.preventDefault();
        const videoSrc = this.getAttribute('data-video-src');
        popUpContent.src = videoSrc;
        popUp.classList.add('active');
    });
});

closePopUp.addEventListener('click', () => {
    popUp.classList.remove('active');
});