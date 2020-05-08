import React from 'react';
import { Component } from 'react';

import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

export default class Index extends Component {
  constructor(props) {
    super(props);
  }

  render () {
    const { steps, currentStep} = this.props;

    return (
        <Stepper activeStep={currentStep}>
            {steps.map(label => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                </Step>
            ))}
        </Stepper>
    );
  }
}