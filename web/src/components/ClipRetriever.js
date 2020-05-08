import React from 'react';
import { Component } from 'react';
import Button from '@material-ui/core/Button';

import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import CircularProgress from '@material-ui/core/CircularProgress';
import { downloadClips } from '../controllers/api';

import '../styles/ClipRetriever.scss';

const DEFAULT_ACCOUNTS = ['tiktok_us', 'ffs_omg', 'TrendingTiktoks', 'supplierofmemes', 'HoodMemesDaily'];

export default class ClipRetriever extends Component {
  constructor(props) {
    super(props);
    this.state = { 
        accountsText: DEFAULT_ACCOUNTS.join('\n'),
        loading: false
    };

    this.handleAccountsChange = this.handleAccountsChange.bind(this);
    this.downloadClips = this.downloadClips.bind(this);
  }

  handleAccountsChange(event) {
      this.setState({ accountsText: event.target.value });
  }

  async downloadClips() {
      const { accountsText } = this.state;
      const accounts = accountsText.split('\n').map(a => a.trim());

      this.setState({ loading: true });
      await downloadClips(accounts);
      this.setState({ loading: false });
  }

  render () {
    const { accountsText, loading } = this.state;
    const downloadEnabled = accountsText.trim() !== '';

    return (
        <div>
            <TextareaAutosize
                value={accountsText}
                onChange={this.handleAccountsChange}
                className="account-list"
                placeholder="Enter accounts line by line"
            />
            <div className="actions">
                {loading ?
                    <CircularProgress />
                : (downloadEnabled && 
                    <Button onClick={this.downloadClips} variant="contained" size="large" color="primary">Download Clips</Button>
                )}
            </div>
        </div>
    );
  }
}