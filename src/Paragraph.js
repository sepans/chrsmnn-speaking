import React, { Component } from 'react'
import ReactDOM from 'react-dom'

class Paragraph extends Component {

	componentWillReceiveProps(nextProps) {
		//why here?
		//this.setScrollTop(nextProps.currentParagraph)
		//console.log('WILL RE')
	}

	setScrollTop(parNumber) {
			const curentEl = ReactDOM.findDOMNode(this.refs[`para-${parNumber}`])
			const listEl = ReactDOM.findDOMNode(this.refs.list)
			console.log('curentEl', parNumber, `para-${parNumber}`, this.refs[`para-${parNumber}`],  curentEl)
			if(curentEl) {
				console.log('has curentEl', ReactDOM.findDOMNode(this.refs.list))
				const paraTop = curentEl.getBoundingClientRect().top
				//console.log('rect', curentEl.getBoundingClientRect())
				//const list = this.refs.list
				const listTop = listEl.getBoundingClientRect().top
				//list.scrollTo(curentEl.getBoundingClientRect().top)
				console.log(paraTop , listTop)
				if(paraTop - listTop > 0) {
					listEl.scrollTop = paraTop - listTop

				}
			}

	}

	componentDidMount() {
		//this.setScrollTop(this.props.currentParagraph)
	}


	render() {
		//console.log('par props', this.props)
		// console.log('currentParagraph', this.props.currentParagraph, `para-${this.props.currentParagraph}`)
		// console.log(this.refs, this.refs[`para-${this.props.currentParagraph}`])
		setTimeout(() => this.setScrollTop(this.props.currentParagraph), 10)
		
		const paragraphs = (this.props.data || []).map((d, i) =>
		{
			return (
					<li key={i} ref={`para-${i}`}>{d.text}</li>
				)
		})
	    return (
	      <ul className='paragraph' style={{display: this.props.display ? 'block': 'none'}} ref='list'>
	        {paragraphs}
	      </ul>
	    )
  }
}



export default Paragraph
