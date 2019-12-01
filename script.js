const audio = document.querySelector('audio')
const iphoneContent = document.querySelector('.iphone-content')
const playBox = iphoneContent.querySelector('.play-box')
const cover = iphoneContent.querySelector('.cover')
const artist = iphoneContent.querySelector('.audio-artist')
const title = iphoneContent.querySelector('.audio-title')


const tracklist = {
    musicSrc: [
        'assets/audd.mp3',
        'assets/chocolat.mp3',
        'assets/stay.mp3',
    ],

    coverSrc: [
        'assets/audd.png',
        'assets/chocolat.jpg',
        'assets/stay.jpg'
    ],

    title: [
        'Au DD',
        'Chocolat',
        'Stay'
    ],

    artist: [
        'PNL',
        'Roméo Elvis',
        'Rihanna'
    ]
}






class MusicPlay {
    constructor(_playBox) {

        //redefining the context
        this.playBox = _playBox

        //Defining property used in many methods
        this.audioElement = audio
        this.currentMusic = 0
        this.volume = 1
        this.musicSrc = tracklist.musicSrc
        this.coverSrc = tracklist.coverSrc
        this.musicTitle = tracklist.title
        this.musicArtist = tracklist.artist



        //Call Methods
        this.setToStorage = (storageTitle, value) => localStorage.setItem(storageTitle, value)

        this.updateValueFromStorage()
        this.togglePlay()
        this.setSeekBar()
        this.setVolume()
        this.setLock()
        this.loadMusics()
        this.changeMusic()
        // this.setShuffle()
        this.setLike()
        this.uploadMusic()

    }

    updateValueFromStorage() {
        if (localStorage.length > 0) {
            const currentTimeUpdated = localStorage.getItem('music')
            this.currentMusic = currentTimeUpdated

            const volumeUpdated = localStorage.getItem('volume')
            this.volume = volumeUpdated
        }

    }

    togglePlay() {

        //Defining constants
        const pause = playBox.querySelector('.pause')
        const play = playBox.querySelector('.play')


        const switchPlayingStateButton = () => {
            //To toggle Play and swith the Playing State Symbol
            if (this.audioElement.paused) {
                this.audioElement.play()
                pause.classList.remove('playingState')
                play.classList.add('playingState')

            } else {
                this.audioElement.pause()
                pause.classList.add('playingState')
                play.classList.remove('playingState')
            }
        }
        // TogglePlay
        this.playBox.addEventListener('click', switchPlayingStateButton)

        document.addEventListener('keydown', (_e) => {
            const keyCode = _e.code

            if (keyCode == 'Space') {
                switchPlayingStateButton()
            }
        })

        this.pauseState = () => {
            pause.classList.add('playingState')
            play.classList.remove('playingState')
        }

        this.playState = () => {
            pause.classList.remove('playingState')
            play.classList.add('playingState')
        }


        this.audioElement.addEventListener('playing', () => {
            this.playState()

        })
        this.audioElement.addEventListener('ended', () => {
            this.pauseState()
        })



    }

    setSeekBar() {
        //Defining constants

        const seekBarFill = iphoneContent.querySelector('.seek-bar-fill')
        const seekBar = iphoneContent.querySelector('.seek-bar')
        const seekBarFillScreen = iphoneContent.querySelector('.full-screen-progress')
        const handle = iphoneContent.querySelector('.handle')

        //Defining functions for events. We do it separately to have the name of the function to put as params in requestAnimationFrame
        const progressBar = () => {
            const ratio = this.audioElement.currentTime / this.audioElement.duration
            seekBarFill.style.transform = `scaleX(${ratio})`
            seekBarFillScreen.style.transform = `scaleX(${ratio * 300})`
            handle.style.transform = `translateX(${ratio * 215}px)` //215 the width of the seekbar


            requestAnimationFrame(progressBar)
        }

        //Update the music timeline
        const setCurrentTime = (_event) => {
            const bounding = seekBar.getBoundingClientRect()
            const ratio = (_event.clientX - bounding.left) / bounding.width
            const time = ratio * this.audioElement.duration

            this.audioElement.currentTime = time
        }

        //Dragging to change the music current Time 
        const dragTimeLine = (_event) => {
            iphoneContent.addEventListener('mousemove', dragging)
            // _event.preventDefault()
        }

        //To set the current time music when the dragging is finished
        const dropTimeLine = () => {
            iphoneContent.removeEventListener('mousemove', dragging)
            handle.addEventListener('mousedown', dragTimeLine) //To listen the drag again

        }
        //to catch the setCurrentTime event and be able to use it in 
        // the addEventListener since we cant set param in event listener when we callback defining funct
        const dragging = (_event) => {
            setCurrentTime(_event)
        }

        //Launching events
        iphoneContent.addEventListener('mouseup', dropTimeLine)


        this.audioElement.addEventListener('timeupdate', progressBar)
        seekBar.addEventListener('click', setCurrentTime)
        handle.addEventListener('mousedown', dragTimeLine)



    }

    setVolume() {

        //Defining constants
        const handleVolume = iphoneContent.querySelector('.handleVolume')
        const seekBarVolume = iphoneContent.querySelector('.seek-bar-volume')
        const seekBarFillVolume = iphoneContent.querySelector('.seek-bar-fill-volume')
        const canVolumeUp = document.querySelectorAll('.js-volume-up')
        const canVolumeDown = document.querySelectorAll('.js-volume-down')



        seekBarFillVolume.style.transform = `scaleX(${this.volume})`
        handleVolume.style.transform = `translateX(${this.volume * 150}px )`


        const setStyleVolume = (toTransform) => {
            seekBarFillVolume.style.transform = `scaleX(${toTransform})`
            handleVolume.style.transform = `translateX(${toTransform * 150}px )`


        }

        const toggleVolume = (_event) => {

            const bounding = seekBarVolume.getBoundingClientRect()
             this.volume = (_event.clientX - bounding.left) / bounding.width

            this.audioElement.volume = this.volume

            setStyleVolume(this.volume)
            this.setToStorage('volume', this.volume)

        }

        const setVolumeUp = () => {
            this.volume = Math.min(this.audioElement.volume + 0.1, 1)
            this.audioElement.volume = this.volume

            setStyleVolume(this.volume)
            this.setToStorage('volume', this.volume)
        }

        const setVolumeDown = () => {
            this.volume = Math.max(this.audioElement.volume - 0.1, 0)
            this.audioElement.volume = this.volume

            setStyleVolume(this.volume)
            this.setToStorage('volume', this.volume)

        }

        seekBarVolume.addEventListener('mousedown', toggleVolume)

        document.addEventListener('keydown', (_e) => {
            const keyCode = _e.code
            if (keyCode == 'ArrowDown') {
                setVolumeDown()
            }
        })

        document.addEventListener('keydown', (_e) => {
            const keyCode = _e.code
            if (keyCode == 'ArrowUp') {
                setVolumeUp()
            }
        })


        canVolumeUp.forEach(_el => {
            _el.addEventListener('click', () => {
                setVolumeUp()
            })
        })


        canVolumeDown.forEach(_el => {
            _el.addEventListener('click', () => {
                setVolumeDown()
            })
        })
    }

    setLock() {
        const lockButton = document.querySelector('.off')

        lockButton.addEventListener('click', () => {

            iphoneContent.classList.toggle('isLocked')

        })
    }

    loadMusics() {


        const setMusicSource = () => {
            this.audioElement.src = this.musicSrc[this.currentMusic]
        }

        const setCoverSource = () => {
            cover.src = this.coverSrc[this.currentMusic]
        }

        const setMusicArtistName = () => {
            artist.innerHTML = this.musicArtist[this.currentMusic]
        }

        const setMusicTitle = () => {
            title.innerHTML = this.musicTitle[this.currentMusic]
        }

        window.addEventListener('load', setMusicSource)
        window.addEventListener('load', setCoverSource)
        window.addEventListener('load', setMusicArtistName)
        window.addEventListener('load', setMusicTitle)


    }

    changeMusic() {

        const previous = iphoneContent.querySelector('.previous')
        const next = iphoneContent.querySelector('.next')

        const updateMusicInfo = () => {
            cover.src = this.coverSrc[this.currentMusic]
            artist.innerHTML = this.musicArtist[this.currentMusic]
            title.innerHTML = this.musicTitle[this.currentMusic]
            this.audioElement.src = this.musicSrc[this.currentMusic]

        }

        //Push to localStorage


        const playNextMusic = () => {
            this.currentMusic < this.musicSrc.length - 1 ?
                this.currentMusic++ : this.currentMusic = 0
            this.setToStorage('music', this.currentMusic)

            this.pauseState() //Define in togglePlay()
            this.audioElement.play()
            updateMusicInfo()
        }

        const playPreviousMusic = () => {
            this.currentMusic > 0 ?
                this.currentMusic-- : this.currentMusic = this.currentMusic = this.musicSrc.length - 1
            this.setToStorage('music', this.currentMusic)

            this.pauseState()
            updateMusicInfo()

        }
        document.addEventListener('keydown', (_e) => {
            const keyCode = _e.code

            if (keyCode == 'ArrowLeft') {
                playPreviousMusic()
            }
        })

        document.addEventListener('keydown', (_e) => {
            const keyCode = _e.code

            if (keyCode == 'ArrowRight') {
                playNextMusic()
            }
        })

        next.addEventListener('click', playNextMusic)
        previous.addEventListener('click', playPreviousMusic)


    }

    // setShuffle() {

    //     const shuffle = iphoneContent.querySelector('.shuffle')
    //     const tracklistKeys = Object.keys(tracklist)

    //     // return an array with the keys ok tracklist Object

    //     const randomVal = (Math.random() - 0.5)

    //     const shuffleVal = (tab, tabLength) => {

    //         return tab[Math.floor(Math.random() * tabLength)]

    //     }
    //     for (const _key in tracklistKeys) {
    //         const eachTabInTheTracklist = tracklist[tracklistKeys[_key]] //Has each tab in my Object tracklist. tracklist

    //         console.log(shuffleVal(eachTabInTheTracklist, eachTabInTheTracklist.length))
    //         console.log(shuffleVal);

    //     }

    // let isShuffled = false

    // const setShuffle = () => {

    //     for (let i = 0; i < tracklist.src.length; i++) {
    //         const randomNumber = Math.random()

    //         shuffledTrackList.src.push(tracklist.src[randomNumber])
    //         shuffledTrackList.cover.push(tracklist.cover[randomNumber])
    //     }

    //     tracklist.src.forEach(m => {

    //     });

    //     for (const _keys in tracklistKeys) {

    //         const key = tracklist[tracklistKeys[_keys]]


    //         for (let i = key.length - 1; i > 0; i--) {
    //             const j = Math.floor(Math.random() * i)
    //             const temp = key[i]
    //             key[i] = key[j]
    //             key[j] = temp
    //         }
    //         console.log(key);

    //     }

    //     isShuffled = true
    //     shuffle.classList.toggle('isActive')

    //     isShuffled == true ? tracklist = {
    //         key
    //     } : tracklist
    //     console.log(tracklist);
    // }

    // shuffle.addEventListener('click', setShuffle)
    // }

    setLike() {

        //Defining variable
        const likeButton = iphoneContent.querySelector('.heart')
        const likedMusicsSection = iphoneContent.querySelector('.liked-musics')
        const backButton = likedMusicsSection.querySelector('.back')
        const notification = iphoneContent.querySelector('.notification')
        const notificationText = iphoneContent.querySelector('.notification p')
        //Creating card el
        let likedMusicCard = document.createElement('div')
        let coverLikedMusicCard = document.createElement('img')

        //tab for 
        const likedTrackList = {
            src: [],
            cover: [],
            title: [],
            artist: []

        }

        //To add the card in DOM with his property (music link, cover...)
        const addElement = () => {

            likedMusicCard = document.createElement('div')
            coverLikedMusicCard = document.createElement('img')


            likedMusicCard.classList.add('liked-music')
            likedMusicsSection.appendChild(likedMusicCard)
            likedMusicCard.appendChild(coverLikedMusicCard)

            coverLikedMusicCard.setAttribute('src', likedTrackList.cover[likedTrackList.cover.length - 1])


            const cards = iphoneContent.querySelectorAll('.liked-music')

            // console.log(cards);

            for (let i = 0; i < cards.length; i++) {
                cards[i].addEventListener('click', () => {
                    this.audioElement.src = likedTrackList.src[i]
                    cover.src = likedTrackList.cover[i]
                    title.innerHTML = likedTrackList.title[i]
                    artist.innerHTML = likedTrackList.artist[i]

                    console.log(this.coverSrc);

                    this.audioElement.play()

                })
            }
        }

        //To remove the card in DOM if it is already present
        const removeElement = () => {
            likedMusicCard.remove()
        }

        const pushToObj = (_action) => {
            likedTrackList.src.push(this.audioElement.src)
            likedTrackList.cover.push(this.coverSrc[this.currentMusic])
            likedTrackList.title.push(this.musicTitle[this.currentMusic])
            likedTrackList.artist.push(this.musicArtist[this.currentMusic])
        }

        const spliceToObj = () => {
            likedTrackList.src.splice(this.audioElement.src)
            likedTrackList.cover.splice(this.coverSrc[this.currentMusic])
            likedTrackList.title.splice(this.musicTitle[this.currentMusic])
            likedTrackList.title.splice(this.musicArtist[this.currentMusic])
        }


        likeButton.addEventListener('click', () => {
            //Check if the music src is still there in the tracklist 
            if (likedTrackList.src.lastIndexOf(this.audioElement.src) == -1) {

                notification.classList.add('isActiveNotif')
                notificationText.innerText = `${this.musicTitle[this.currentMusic]} has been liked`
                setTimeout(() => {
                    notification.classList.remove('isActiveNotif')
                }, 1500);

                likeButton.classList.add('hasLiked')
                pushToObj()


                addElement()

            } else {
                likeButton.classList.remove('hasLiked')

                spliceToObj()
                removeElement()
            }

        })

        let pressTimer
        likeButton.addEventListener('mouseup', () => {
            clearTimeout(pressTimer)
            return false
        })
        likeButton.addEventListener('mousedown', () => {
            pressTimer = window.setTimeout(() => {
                likedMusicsSection.classList.add('isActive')
            }, 500)
        })

        backButton.addEventListener('click', () => {
            likedMusicsSection.classList.remove('isActive')
        })

    }

    uploadMusic() {
        const uploadButton = iphoneContent.querySelector('.upload-button')
        const uploadSection = iphoneContent.querySelector('.upload-files')
        const backUpload = iphoneContent.querySelector('.back-upload')
        const files = document.querySelector('#files')


        //To open Panel
        uploadButton.addEventListener('click', () => {
            uploadSection.classList.add('isActive')
        })

        //To close Panel (Cannot set the same function to 
        // close and stop the music otherwhise need necesssarly pick a file to be able to close)
        backUpload.addEventListener('click', () => {
            uploadSection.classList.remove('isActive')
        })

        window.onload = () => {


            window.AudioContext = window.AudioContext || window.webkitAudioContext;

            const context = new AudioContext()

            const source = context.createBufferSource()
            const play = document.querySelector('.playFile')


            const playSound = arrayBuffer => {
                context.decodeAudioData(arrayBuffer, function (buffer) {
                    source.connect(context.destination)
                    source.buffer = buffer

                    play.addEventListener('click', () => {
                        source.start(0);
                        play.classList.remove('isActivePlayFile')

                        files.style.transform = 'scale(0)'
                        document.querySelector('.message').style.transform = 'scale(1)'

                    })

                    // stopMusicAndClosePanel(source)
                    backUpload.addEventListener('click', () => {

                        uploadSection.classList.remove('isActive')
                        source.stop()

                    })

                    // 
                });
            }

            const handleFileSelect = _event => {
                var files = _event.target.files // FileList object
                playFile(files[0])
                play.classList.add('isActivePlayFile')

            }

            const playFile = file => {
                var fileReader = new FileReader()
                fileReader.addEventListener('load', _e => {
                    playSound(_e.target.result)
                })
                fileReader.readAsArrayBuffer(file)
            }

            files.addEventListener('change', handleFileSelect, false)
        }
    }
}

const player = new MusicPlay(playBox)