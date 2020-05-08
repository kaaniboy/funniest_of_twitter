import React from 'react';
import { Component } from 'react';
import ReactPlayer from 'react-player';
import Button from '@material-ui/core/Button';

import { getClips, deleteClip } from '../controllers/api';

const CLIP_PREFIX = 'http://localhost:9000/static/';

export default class ClipCurator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentClip: 0,
      clips: []
    }
    
    this.include = this.include.bind(this);
    this.exclude = this.exclude.bind(this);
  }

  async componentDidMount() {
    const clips = await getClips();
    this.setState({ clips });
  }

  include() {
    this.setState(prev => ({
      currentClip: prev.currentClip + 1
    }));
  }

  async exclude() {
    const { clips, currentClip } = this.state;
    const clip = clips[currentClip];
    
    await deleteClip(clip);
    const refreshedClips = await getClips();
    this.setState({ clips: refreshedClips });
  }

  render () {
    const { clips, currentClip } = this.state;
    if (clips.length === 0) return <div>No clips to view.</div>;
    const clip = clips[currentClip];

    return (
      <div>
        <h1>Clip {currentClip + 1} of {clips.length}</h1>
        <h3>{clip}</h3>
        <ReactPlayer url={CLIP_PREFIX + clip} controls={true} playing={true}/>
        <div className="actions">
          <Button onClick={this.include} variant="contained" size="large" color="primary">Include</Button>
          <Button onClick={this.exclude} variant="contained" size="large" color="secondary">Exclude</Button>
        </div>
      </div>
    );
  }
}