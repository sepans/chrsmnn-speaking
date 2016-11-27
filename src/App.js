import React, { Component } from 'react'
import './App.css'
import Player from './Player'
import Paragraph from './Paragraph'

import AudioFileList from './AudioFileList'

import SpeakingData from './static/speaking.json'
import GoonData from './static/goon.json'

import Sidebar from 'react-sidebar';

const GOON = 'GOON', SPEAKING = 'SPEAKING', SPEAKING_PLUS_GOON = 'SPEAKING_PLUS_GOON', GOON_PLUS_SPEAKING = 'GOON_PLUS_SPEAKING'

const PLAY_MODES = [ SPEAKING, GOON, SPEAKING_PLUS_GOON, GOON_PLUS_SPEAKING]

const SCREEN_CONTINUE = 'SCREEN_CONTINUE'
const SCREEN_A_BTNS = 'SCREEN_A_BTNS'
const SCREEN_PLAY_PAUSE_BTNS = 'SCREEN_PLAY_PAUSE_BTNS'

const CHANNEL_BOTH = 'CHANNEL_BOTH', CHANNEL_LEFT = 'CHANNEL_LEFT', CHANNEL_RIGHT = 'CHANNEL_RIGHT'

const STORAGE_KEY = 'chrsmnn_last_speaking_para';

const initialState ={
  speakingLoaded: false,
  storageLoaded: false,
  playing: true,
  screenMode: SCREEN_A_BTNS,
  displaydiv: false,
  textPaneOpen: false,
  playMode: GOON,
  sidebarOpen: false,
  players: [
    {
      paragraph: 0,
      playing: false,
      pan: 1,
      time: 0

    },
    {
      paragraph: 0,
      playing: false,
      pan: -1,
      time: 0

    }

  ],
  playedParagraphs: []
}

class App extends Component {

  constructor(props) {
    super(props)

    this.state = initialState;

    this.sounds = []
    this.soundParagraphs = [-1, -1]
    this.timer = []


    this.timeIsUp = this.timeIsUp.bind(this)

  }
  componentDidMount() {

    //const mql = window.matchMedia(`(min-width: 600px)`);

    this.speaking = SpeakingData.paragraphs.map(d => {
      const parts = d.time_min.split(':')
      const seconds = (+parts[0])*60 + (+parts[1])
      return {
        ...d,
        time: seconds

      }
    })
    this.goon = GoonData.paragraphs.map(d => {
      const parts = d.time_min.split(':')
      const seconds = (+parts[0])*60 + (+parts[1])
      return {
        ...d,
        time: seconds

      }
    })


    setTimeout(() => {
      this._loadInitialState()//.done()

    }, 100)


    console.log('setting the state componentDidMount ')
    this.setState({...this.state, speakingLoaded: true});

  }

  _loadInitialState() {

    console.log('INITIAL STATE')
    let value
    try {
       value = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.log('AsyncStorage error: ', error.message);
      return;
    }

    if (value !== null) {
      const storedParNum1 = JSON.parse(value).player1Paragraph
      const storedParNum2 = JSON.parse(value).player2Paragraph
      const playMode = JSON.parse(value).playMode
      const playedParagraphs = JSON.parse(value).playedParagraphs || []

      this.setState({...this.state, storageLoaded: true, screenMode: SCREEN_CONTINUE})

      this.recoveredState = {...this.state,
        storageLoaded: true,
        screenMode: SCREEN_PLAY_PAUSE_BTNS,
        playMode: playMode,
        playing: true,
        players: [
          { ...this.state.players[0],
            paragraph: storedParNum1,
            playing: true,
            time: this.speaking[storedParNum1] ? this.speaking[storedParNum1].time : 0, //TODO fix time
            pan: playMode===SPEAKING_PLUS_GOON ? 1 : -1
          },
          { ...this.state.players[1],
            paragraph: storedParNum2,
            playing: true,
            time: this.goon[storedParNum2] ? this.goon[storedParNum2].time : 0, //TODO fix time
            pan: playMode===SPEAKING_PLUS_GOON ? -1 : 1
          }
        ],
        playedParagraphs: playedParagraphs
      }

      console.log('Recovered State ', this.recoveredState)


    }
    else {
      this.setState({...this.state, storageLoaded: true});
      localStorage.setItem(STORAGE_KEY, JSON.stringify({playMode: this.state.playMode,
         player1Paragraph:  0, player2Paragraph:  0, playedParagraphs: []}))
    }


  }




  componentWillUpdate(nextProps, nextState) {

  }



  render() {

    console.log('------ RENDER, state', this.state)

    if(!this.state.storageLoaded || !this.state.speakingLoaded) {
      return <div/>
    }

    const { players, playing, screenMode, /*playMode,*/ playedParagraphs} = this.state


    const modeBtns = (
      <div style={{alignItems: 'center'}}>
        <button   onClick={(e) => this._handleModePlayPressed(PLAY_MODES[0])}>
          <span className="hover">speaking is difficult</span>
        </button>
        <div className="or">or</div>
        <button onClick={(e) => this._handleModePlayPressed(PLAY_MODES[1])}>
          <span className="hover">go on, make me</span>
        </button>
        <div className="or">or</div>
        <button onClick={(e) => this._handleModePlayPressed(PLAY_MODES[2])}>
          <span className="hover">speaking is difficult / go on, make me</span>
        </button>
        <div className="or">or</div>
        <button onClick={(e) => this._handleModePlayPressed(PLAY_MODES[3])}>
          <span className="hover">go on, make me / speaking is difficult</span>
        </button>
      </div>
    )

    const btnColor = playing ? '#FF0000' : '#00FF00'
    const textBtn = <button  onClick={(e) => this.showdiv()}>text</button>
    const playPauseBtns =  (
      <div style={{flexDirection:'row', alignSelf: 'stretch', padding: 15}}>
        <div style={{alignItems: 'flex-start', flex: 1 }}>
          <button key="playpause" style={{backgroundColor: btnColor, width: 20, height: 20, borderRadius: 10 }} onClick={(e) => this.playPause()}>

          </button>
        </div>
        <div style={{width: 50}} onClick={() => this.showText()}>{textBtn}</div>
      </div>
    )

    const continueBtns = (
      <div>
        <button key="continue"

                onClick={(e) => this.continuePlaying()}>
          resume
        </button>
        <div style={{marginTop: 20}}/>
        <button key="startover"

                onClick={(e) => this.startOverPlaying()}>
          start again
        </button>
      </div>

    )
    let btns;
    switch(screenMode) {
      case SCREEN_A_BTNS:
        btns = modeBtns;
        break;
      case SCREEN_PLAY_PAUSE_BTNS:
        btns = playPauseBtns;
        break;
      case SCREEN_CONTINUE:
        btns = continueBtns;
        break;
      default:
        btns = <div/>
        break;
     //= screenMode===SCREEN_A_BTNS ? modeBtns : playPauseBtns
    }
    console.log('player 0 paragraph', players[0].paragraph, 'player 0 paragraph', players[1].paragraph)


    const paragraphsUptoNow = playedParagraphs.map((par, i) => {
      //{text: SPEAKING, num: newPragraphNum, channel: CHANNEL_RIGHT}
      const textSegments = par.text===GOON ? this.goon : this.speaking
      const paragraphdiv = textSegments[par.num].text
      const textAlign = par.channel===CHANNEL_RIGHT ? 'right' : 'left'
      console.log(par, textAlign)
      return <div key={`para-${par.text}-${par.num}`} ref={`para-${par.text}-${par.num}`} style={{padding: 20, textAlign: textAlign, color: '#333'}}>{paragraphdiv}</div>
    })



    const text = (
      <div ref="textscroll" className="text-scroll">
        {paragraphsUptoNow}
      </div>
    )

    const textscroll = this.refs.textscroll
    if(textscroll) {
      setTimeout(() => {
        textscroll.scrollTop = textscroll.scrollHeight;

      }, 1000)
    }

    const playerEls = this.state.players.map((d, i) => {
      const playerProps = {...d, index: i,
         src: i===0 ? AudioFileList.speaking[d.paragraph] : AudioFileList.goon[d.paragraph],
         onFinish: this.timeIsUp,
         playing: d.playing && this.state.playing

       }
      return (
        <Player {...playerProps} key={i}/>
      )
    })

    return (
        <Sidebar
          sidebar={text}
          ref="sidebar"
          open={this.state.sidebarOpen}

          pullRight="true"
          touchHandleWidth="20"
          onSetOpen={(open) => this.setState({...this.state, sidebarOpen: open})}
          sidebarClassName="text-pane"
          styles={{overlay: {backgroundColor: 'white'}}}
          shadow={false}
          >
          <div>
              <div className="headphones">
                <div style={{ color: '#000'}}>for headphones</div>
              </div>
              <div className='container'>
                <div style={{alignSelf: 'stretch',}}>
                  {btns}
                </div>
              </div>
            <button className="delete"  onClick={(e) => this.clearStorage()}>Delete storage</button>
            {playerEls}





          </div>
        </Sidebar>
    )

  }

  timeIsUp(i) {

    const { playMode, playedParagraphs } = this.state

    const textSegments = i===0 ? this.speaking : this.goon

    console.log(' ----- Time is up for ', i, this, this.state, this.state.players, this.state.players[i])
    if(!this.state.players[i].playing || !this.state.playing) {
      return
    }

    if (i===0 && playMode===GOON_PLUS_SPEAKING) {


      const newPragraphNum = Math.floor(Math.random() * textSegments.length)
      const newTime = textSegments[newPragraphNum].time

      console.log('randomizing ', i, ' to ', newPragraphNum)

      playedParagraphs.push({text: SPEAKING, num: newPragraphNum, channel: CHANNEL_RIGHT})

      this.setState({...this.state, players: [
               { ...this.state.players[0], paragraph: newPragraphNum, time: newTime}, //
               { ...this.state.players[1]}
        ],
        playedParagraphs: playedParagraphs
      })


      localStorage && localStorage.setItem(STORAGE_KEY, JSON.stringify({playMode: this.state.playMode,
             player1Paragraph: newPragraphNum, player2Paragraph: this.state.players[1].paragraph,
             playedParagraphs: playedParagraphs
           }))



    }
    else if (i===1 && playMode===SPEAKING_PLUS_GOON) {

      const newPragraphNum = Math.floor(Math.random() * textSegments.length)
      const newTime = textSegments[newPragraphNum].time

      console.log('randomizing ', i, ' to ', newPragraphNum)

      playedParagraphs.push({text: GOON, num: newPragraphNum, channel: CHANNEL_RIGHT})

      this.setState({...this.state, players: [
               { ...this.state.players[0]}, //
               { ...this.state.players[1], paragraph: newPragraphNum, time: newTime}
        ],
        playedParagraphs: playedParagraphs
      })

      //this.sounds[i].setCurrentTime(newTime)


      localStorage && localStorage.setItem(STORAGE_KEY, JSON.stringify({playMode: this.state.playMode,
             player1Paragraph: this.state.players[0].paragraph, player2Paragraph: newPragraphNum,
             playedParagraphs: playedParagraphs
           }))


    }
    else if (i===0) {
      //TODO if player.paragraph + 1 > thisSegments.length
      const newPragraphNum = this.state.players[i].paragraph + 1
      const newTime = textSegments[newPragraphNum].time

      console.log('continue ', i, ' with ', newPragraphNum)

      playedParagraphs.push({text: SPEAKING, num: newPragraphNum, channel: CHANNEL_LEFT}) // or both, does it matter?

      this.setState({...this.state, players: [
               { ...this.state.players[0], paragraph: newPragraphNum, time: newTime}, //
               { ...this.state.players[1]}
        ],
        playedParagraphs: playedParagraphs
      })


      localStorage && localStorage.setItem(STORAGE_KEY, JSON.stringify({playMode: this.state.playMode,
             player1Paragraph: newPragraphNum, player2Paragraph: this.state.players[1].paragraph,
             playedParagraphs: playedParagraphs
           }))

    }
    else if (i===1) {

      const newPragraphNum = this.state.players[i].paragraph + 1
      const newTime = textSegments[newPragraphNum].time

      console.log('continue ', i, ' with ', newPragraphNum)

      playedParagraphs.push({text: GOON, num: newPragraphNum, channel: CHANNEL_LEFT}) // or both, does it matter?

      this.setState({...this.state, players: [
               { ...this.state.players[0]}, //
               { ...this.state.players[1], paragraph: newPragraphNum, time: newTime}
        ],
        playedParagraphs: playedParagraphs
      })

      localStorage && localStorage.setItem(STORAGE_KEY, JSON.stringify({playMode: this.state.playMode,
             player1Paragraph: this.state.players[0].paragraph, player2Paragraph: newPragraphNum,
             playedParagraphs: playedParagraphs
           }))

    }

  }

  playSound(mode) {

   // const { players } = this.state
    let rand
    let newState

    switch(mode) {
      case SPEAKING:
        newState = {
          ...this.state,
          screenMode: SCREEN_PLAY_PAUSE_BTNS,
          playMode: mode,
          players: [
            {
              playing: true,
              pan: 0,
              time: this.speaking[this.state.players[0].paragraph].time,
              paragraph: this.state.players[0].paragraph
            },
            {
              playing: false,
              pan: 0,
              time: 0,
              paragraph: this.state.players[1].paragraph

            }
          ],
          playedParagraphs: [{text: SPEAKING, num: 0, channel: CHANNEL_BOTH}]
        }

        break;
      case GOON:
        newState = {
          ...this.state,
          screenMode: SCREEN_PLAY_PAUSE_BTNS,
          playMode: mode,
          players: [
            {
              playing: false,
              pan: 0,
              time: 0,
              paragraph: this.state.players[0].paragraph
            },
            {
              playing: true,
              pan: 0,
              time: this.goon[this.state.players[0].paragraph].time,
              paragraph: this.state.players[1].paragraph

            }
          ],
          playedParagraphs: [{text: GOON, num: 0, channel: CHANNEL_BOTH}]
        }
        break;
      case SPEAKING_PLUS_GOON:
        //if A+1, then A plays straight through on left channel and the paras of 1 are randomised and played on right.
        rand = Math.floor(Math.random() * this.goon.length)
        newState = {
          ...this.state,
          screenMode: SCREEN_PLAY_PAUSE_BTNS,
          playMode: mode,
          players: [
            {
              playing: true,
              pan: 1,
              time: 0,
              paragraph: 0

            },
            {
              playing: true,
              pan: -1,
              time: this.goon[rand].time,
              paragraph: rand

            }
          ],
          playedParagraphs: [{text: SPEAKING, num: 0, channel: CHANNEL_LEFT},
                             {text: GOON, num: rand, channel: CHANNEL_RIGHT}]
        }
        break;
      case GOON_PLUS_SPEAKING:
        //if 1+A, then 1 plays L and A is randomised on R
        rand = Math.floor(Math.random() * this.speaking.length)
        newState = {
          ...this.state,
          screenMode: SCREEN_PLAY_PAUSE_BTNS,
          playMode: mode,
          players: [
            {
              playing: true,
              pan: -1,
              time: this.speaking[rand].time,
              paragraph: rand

            },
            {
              playing: true,
              pan: 1,
              time: this.goon[this.state.players[1].paragraph].time,
              paragraph: this.state.players[1].paragraph

            }
          ],
          playedParagraphs: [{text: GOON, num: 0, channel: CHANNEL_LEFT},
                             {text: SPEAKING, num: rand, channel: CHANNEL_RIGHT}]
        }
        break;
      default:
        break;
    }

    this.setState(newState, () => {
      localStorage && localStorage.setItem(STORAGE_KEY, JSON.stringify({playMode: newState.playMode,
       player1Paragraph: newState.players[0].paragraph, player2Paragraph: newState.players[1].paragraph,
       playedParagraphs: newState.playedParagraphs
     }))

    })


  }

  showText() {
    console.log('SHOW TEXT')
    this.setState({...this.state, sidebarOpen: !this.state.sidebarOpen})

  }

  _handleModePlayPressed(mode) {
        console.log('Pressed!!!!', mode)
        this.playSound(mode)
  }

  playPause() {
    console.log('playpaused ', this.state.playing)
    this.setState({...this.state, playing: !this.state.playing})
  }

  continuePlaying() {

    console.log('recoveredState', this.recoveredState)
    this.setState(this.recoveredState)
  }

  startOverPlaying() {

    this.setState({...this.state, screenMode: SCREEN_A_BTNS})

  }

  clearStorage() {
    localStorage.removeItem(STORAGE_KEY)

  }

  showdiv() {

  }
}



export default App
