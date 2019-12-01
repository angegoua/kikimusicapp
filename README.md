# kikimusicapp
A school project music app

## Features

* Drag or click the seekbar to change the music time
* Change volume by clicking
* Navigate with arrow and space bar(left and right to change music & up and down to change volume & space bar to pause and play)
* localStorage save your music and volume setting 
* Like a music. When you like a music, there is a notification. You can long press the heart button to see liked musics
* Upload by music by clicking on the upload button and reckick on the panel which appear

* Fun webGL Mouse effect on the home page
* Video stream audio visualisation  with canvas and webGL 
* Click to play and stop the stream and audio

## To add music

Just add your music link, the cover, the artist name, and the song name in the tracklist object
```
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

```

Care the order of your music. If you set a link a position 4, you have to set its corresponding elements at the position 4 in the other key of the tab 

## Design & Inspiration

I, myself, dit the design proto on Adobe XD by keeping in king itunes App Dark mode. I want to give a remastered version.

## Thanks

Thanks to Francois Xavier & Corto to help me.

Thanks also to my favorite and amazing, teacher, the best of the best of the best dev, BRUNO SIMON to help me.

Thanks to the Facebook forum Web Developpeurs & Developpeurs Francophones.

And the video camera visualiser has been done thanks to a tutorial of codrops 
https://tympanus.net/Tutorials/webcam-audio-visualizer/
