import React, { Component } from 'react'
import './App.css'
import Player from './Player'
import Paragraph from './Paragraph'
import SpeakingData from './static/speaking.json'
//import AudioSrc from './static/speaking.mp3'
const AudioSrc = require("file!./static/speaking.mp3");
//const AudioSrc = require("file!./static/anthem.ogg");


//const LEFT = 'left', RIGHT = 'right', CENTER = 'center'

const ONE_OR_A = '1 or A', A_PLUS_ONE = 'A + 1', ONE_PLUS_A = '1 + A'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      lastParagraph: 10,
      players: [
        {
          playing: false,
          gainLeft: 0,
          gainRight: 1,
          time: 0

        },
        {
          playing: false,
          gainLeft: 1,
          gainRight: 0,
          time: 0

        }

      ]
    }
  }
  componentDidMount() {
    this.speaking = SpeakingData.paragraphs.map(d => {
      const parts = d.time_min.split(':')
      const seconds = (+parts[0])*60 + (+parts[1])
      return {
        ...d,
        time: seconds

      }
    })
    const times = [this.speaking[1].time, this.speaking[2].time]
    this.setState({...this.state, players: [
       { ...this.state.players[0], time: times[0]},
       {...this.state.players[1], time: times[1]},

      ]})
  }
  /*
  pan(side) {
    if(side===LEFT) {
      this.setState({gainLeft: 1, gainRight: 0})
    }
    else if(side===RIGHT) {
      this.setState({gainLeft: 0, gainRight: 1})
    }
    if(side===CENTER) {
      this.setState({gainLeft: 1, gainRight: 1})
    }
  }
  */
  play(mode) {
    const {lastParagraph, players} = this.state
    let rand
    switch(mode) {
      case ONE_OR_A:
        this.setState({
          ...this.state,
          players: [
            {
              playing: true,
              gainLeft: 1,
              gainRight: 1,
              time: this.speaking[lastParagraph].time

            },
            {
              playing: false,
              gainLeft: 1,
              gainRight: 1,
              time: 0

            }
          ]
        })
        break;
      case ONE_PLUS_A:
        rand = Math.floor(Math.random() * this.speaking.length)
        this.setState({
          ...this.state,
          players: [
            {
              playing: true,
              gainLeft: 1,
              gainRight: 0,
              time: this.speaking[lastParagraph].time

            },
            {
              playing: true,
              gainLeft: 0,
              gainRight: 1,
              time: this.speaking[rand].time

            }
          ]
        })
        break;
      case A_PLUS_ONE:
        rand = Math.floor(Math.random() * this.speaking.length)
        this.setState({
          ...this.state,
          players: [
            {
              playing: true,
              gainLeft: 1,
              gainRight: 0,
              time: this.speaking[lastParagraph].time

            },
            {
              playing: true,
              gainLeft: 0,
              gainRight: 1,
              time: this.speaking[rand].time

            }
          ]
        })
        break;
    }
  }
  render() {
    //const firstPar = this.speaking ? this.speaking[0].time : 0
    //const secondPar = this.speaking ? this.speaking[1].time : 0
    console.log('STATE', this.state)
    const players = this.state.players.map((d, i) => {
      const playerProps = {...d, src: AudioSrc}
      return (
        <Player {...playerProps} key={i}/>
      )
    })
    return (
      <div className="App">
        <div className="dot" onClick={() => this.play(ONE_OR_A)}>
          <span className="hover">Play 1 or A</span>
        </div>
        <div className="dot" onClick={() => this.play(A_PLUS_ONE)}>
          <span className="hover">Play A + 1</span>
        </div>
        <div className="dot" onClick={() => this.play(ONE_PLUS_A)}>
          <span className="hover">Play 1 + A</span>
        </div>
        {players}
        <Paragraph data={this.speaking} currentParagraph={this.state.lastParagraph} display={this.state.players[0].playing} />    
      </div>
    )
  }
}

export default App
