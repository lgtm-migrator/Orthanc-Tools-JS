import React, { Component, Fragment } from 'react'
import ModalModify from './ModalCreateDicom';


export default class CreateDicom extends Component {

    state = {
        show: false
    }

    openModify = () => {
        this.setState({ show: true })
    }

    render = () => {
        console.log(this.props)
        return (
            <Fragment>
                <button className='dropdown-item bg-primary' type='button' hidden={this.props.hidden} onClick={this.openModify} >Create Dicom </button>
                <ModalModify
                    show={this.state.show}
                    onHide={() => this.setState({ show: false })}
                    data={this.state.data}
                    level={this.props.level}
                    modify={() => this.modify()}
                />
            </Fragment>
        )
    }
}