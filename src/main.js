/**
 * How does it works 
 * 1- Load audio from a source 
 * 2- Init the audiostream component by providing an audio source 
 *    The audiostream class provides methods to get data from the loaded source
 * 3- Init the AudioAnalyser 
 *    This is different from the Audio API analyser node
 *    This component can process audio data provided by the audiostream to get
 *    informations on the audio, such as amplitude, peak, multi-band analysis
 * 4- (optional) Preview the audio data using DataVisualizer
 *    This draws informations provided by the AudioAnalyser under the <body> tag
 * 5- In the main loop, follow the example to see how data cycle is processed
 */

import { UserSelection } from './user-selection/user-selection';
import { AudioSource } from './audiostream/audio-source';
import { AudioStream } from './audiostream/audio-stream';
import { AudioAnalyser } from './audioanalysis/audio-analyser';
import { AnalysedDataVisualizer } from './audioanalysis/utility/analysed-data-visualizer';
import { Loader } from './loader/loader';
import { Stats } from './tools/stats';
import { GUI } from './tools/gui';
import UserControls from './user-controls';


// Size of the fft transform performed on audio stream
const FFT_SIZE = 512;

// Volume of the source
const VOLUME = 0.2;

let userSelection = new UserSelection( (selectionType, info) => {

  let loader = new Loader();

  // 1- we create the components
  let audiosource = new AudioSource();
  let audiostream = new AudioStream( audiosource, FFT_SIZE, VOLUME );
  let audioAnalyser = new AudioAnalyser( audiostream.getBufferSize() );

  // Visual informations on the analysed data
  let visuHelper = new AnalysedDataVisualizer();
  visuHelper.init();

  let startTimer = null,
      lastFrameTimer = null,
      deltaTime = null;

  let stats = new Stats( Stats.POSITIONS.BOTTOM_RIGHT );

  let gui = new GUI( UserControls );

  switch( selectionType )
  {
    case UserSelection.LOAD_TYPE.LIBRARY_FILE:
      audiosource.loadAudioFromLibrary( info ).then(init);
      break;

    case UserSelection.LOAD_TYPE.INPUT_MICROPHONE:
      audiosource.getStreamFromMicrophone().then(init);
      break;
    
    case UserSelection.LOAD_TYPE.INPUT_FILE:
      audiosource.loadAudioFromFile( info ).then(init);
      break;
  }

  function init()
  {
    audiostream.init();
    if( selectionType != UserSelection.LOAD_TYPE.INPUT_MICROPHONE )
      audiosource.play();
    startTimer = new Date();
    loader.loaded();
    analysis();
  }

  function analysis()
  {
    window.requestAnimationFrame( analysis );

    stats.begin();
    let currentTimer = new Date(),
        deltaTime    = currentTimer - lastFrameTimer;

    // we send the audio data to the analyser for analysis
    audioAnalyser.analyse( audiostream.getAudioData(), deltaTime, currentTimer )
    let analysedData = audioAnalyser.getAnalysedData(); // we ge the analysed data
    
    // we ask the helper to draw the analysed data
    // this is where we can send the data to a proper visualizer
    visuHelper.draw( analysedData, startTimer );

    lastFrameTimer = currentTimer;
    stats.end();
  }

});

// handles the library loading
/*let loader = new Loader();

// 1- we create the components
let audiosource = new AudioSource();
let audiostream = new AudioStream( audiosource, FFT_SIZE, VOLUME );
let audioAnalyser = new AudioAnalyser( audiostream.getBufferSize() );

// Visual informations on the analysed data
let visuHelper = new AnalysedDataVisualizer();
visuHelper.init();

let startTimer = null,
    lastFrameTimer = null,
    deltaTime = null;

let stats = new Stats( Stats.POSITIONS.BOTTOM_RIGHT );

let gui = new GUI( UserControls );


audiosource.loadAudioFromFile( './dist/audio/owl.mp3' ).then( ()=>{
  audiostream.init();
  audiosource.play();
  startTimer = new Date();
  loader.loaded();
  analysis();
});*/


