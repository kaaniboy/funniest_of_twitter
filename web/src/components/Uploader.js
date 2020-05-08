import React from 'react';
import { Component } from 'react';
import Button from '@material-ui/core/Button';

import { uploadToYouTube } from '../controllers/api';

export default class Uploader extends Component {
  constructor(props) {
    super(props);
    this.state = { 
        loading: false
    };

    this.upload = this.upload.bind(this);
  }

  upload() {
    uploadToYouTube();
  }

  render () {
    return (
        <div className="actions">
          <Button onClick={this.upload} variant="contained" size="large" color="secondary">Finalize and Upload</Button>
        </div>
    );
  }
}