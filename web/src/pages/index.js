import React from 'react';
import { Component } from 'react';
import Button from '@material-ui/core/Button';

import ClipRetriever from '../components/ClipRetriever';
import ClipCurator from '../components/ClipCurator';
import Progress from '../components/Progress';
import Uploader from '../components/Uploader';
import '../styles/index.scss';

const STEPS = ['Retrieve Clips', 'Curate Clips', 'Upload', 'Confirmation'];
const RETRIEVE_STEP = 0;
const CURATE_STEP = 1;
const UPLOAD_STEP = 2;
const CONFIRMATION_STEP = 3;

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
    }

    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    this.setState(prev => ({
      currentStep: prev.currentStep + 1
    }));
  }

  render () {
    const { currentStep } = this.state;
    const nextEnabled = currentStep < STEPS.length - 1;

    return (
      <div className="container">
        <Progress steps={STEPS} currentStep={currentStep}/>

        {currentStep === RETRIEVE_STEP && <ClipRetriever />}
        {currentStep === CURATE_STEP && <ClipCurator />}
        {currentStep === UPLOAD_STEP && <Uploader />}
        {currentStep === CONFIRMATION_STEP && <div>Done!</div>}
        
        <div className="actions">
          {nextEnabled &&
            <Button onClick={this.nextStep} variant="contained" size="large" color="default">Next Step</Button>
          }
        </div>
      </div>
    );
  }
}