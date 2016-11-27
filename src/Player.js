import React, { Component } from 'react'

class Player extends Component {

  constructor(props) {

    super(props)

    this.panMap = {
      "-1": [1, 0],
      "0": [1, 1],
      "1": [0, 1]
    }

  }
  componentDidMount() {

    this.player = this.refs.audio

    window.audioContext = window.audioContext||window.webkitAudioContext; //fallback for older chrome browsers

    const context = new AudioContext();
    const source = context.createMediaElementSource(this.player)

    context.createGain = context.createGain||context.createGainNode; //fallback for gain naming
    this.gainL = context.createGain();
    this.gainR = context.createGain();
    const splitter = context.createChannelSplitter(2);
    source.connect(splitter, 0, 0);

    const merger = context.createChannelMerger(2);


    splitter.connect(this.gainL, 0);
    splitter.connect(this.gainR, 1);


    this.gainL.connect(merger, 0, 0)
    this.gainR.connect(merger, 0, 1)

    merger.connect(context.destination)


    this.gainL.gain.value = 1;
    this.gainR.gain.value = 1;

    if(this.props.playing) {
          this.player.play()

    }

    this.player.addEventListener('ended', () => this.props.onFinish(this.props.index))


  }
  /*
  getDefaultProps() {
    return {
      gainLeft: 1,
      gainRight: 1,
      curTime: 0
    }
  }
  */
  componentWillUpdate(nextProps, nextState) {
    //console.log('nextProps', nextProps, this.props)
    /*
    if(nextProps.playing!==this.props.playing) {
      if(nextProps.playing===true) {

        setTimeout(() => this.player.play(), 500) // todo play when ready
        this.player.addEventListener('ended', () => this.props.onFinish(this.props.index))
      }
      else {
        this.player.pause()
      }
    }
    */

    /*
    console.log('prev onFinish',  this.props.onFinish)

    console.log('next onFinish', nextProps.onFinish)

    if(nextProps.onFinish && !this.props.onFinish) {
        console.log('set on finish')
        this.player.addEventListener('ended', () => nextProps.onFinish(this.props.index))
    }
    else if(!nextProps.onFinish && this.props.onFinish) {
        this.player.removeEventListener('ended', this.props.onFinish)



    }
    */
  }

  render() {

    console.log('player props', this.props)
    if(this.gainL && this.gainR) {
      this.gainL.gain.value = this.panMap[this.props.pan][0] ;
      this.gainR.gain.value = this.panMap[this.props.pan][1];
      //this.player.currentTime = this.props.time

    }


    if(this.props.playing && this.player && this.player.paused) {
       setTimeout(() => this.player.play(), 500) // todo play when ready
    }
    else if (!this.props.playing && this.player && !this.player.paused) {
      this.player.pause()
    }


    return (
      <div>
        <audio src={this.props.src} ref='audio' controls/>
      </div>
    )
  }
}


Player.propTypes = {
  index: React.PropTypes.number,
  src: React.PropTypes.string.isRequired,
  pan: React.PropTypes.number,
  time: React.PropTypes.number,
  onFinish: React.PropTypes.func,
  playing: React.PropTypes.boolean
}


export default Player
