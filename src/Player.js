import React, { Component } from 'react'

class Player extends Component {
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
  componentWillReceiveProps(nextProps) {
    if(nextProps.playing!==this.props.playing) {
      if(nextProps.playing===true) {
        this.player.play()
      }
      else {
        this.player.pause()
      }
    }
  }
  render() {

    console.log('playe props', this.props)
    if(this.gainL && this.gainR) {
      this.gainL.gain.value = this.props.gainLeft;
      this.gainR.gain.value = this.props.gainRight;
      this.player.currentTime = this.props.time

    }


    return (
      <div>
        <audio src={this.props.src} ref='audio' controls/>
      </div>
    )
  }
}

Player.propTypes = {
  src: React.PropTypes.string.isRequired,
  gainLeft: React.PropTypes.number,
  gainRight: React.PropTypes.number,
  time: React.PropTypes.number,
  playing: React.PropTypes.boolean
}

export default Player
