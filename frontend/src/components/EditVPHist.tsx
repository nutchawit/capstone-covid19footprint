import * as React from 'react'
import { History } from 'history'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { VPHist } from '../types/VPHist';
import { patchVPHist, getUploadUrl, uploadFile } from '../api/vphist-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditVPHistProps {
  match: {
    params: {
      historyId: string
    }
  }
  auth: Auth
  history: History
}

interface EditVPHistState {
  vPHistName: string
  vPHistPurpose: string
  vAttachmentFile: any
  attachmentUploadState: UploadState
}

export class EditVPHist extends React.PureComponent<
  EditVPHistProps,
  EditVPHistState
> {
  state: EditVPHistState = {
    vPHistName: '',
    vPHistPurpose: '',
    vAttachmentFile: undefined,
    attachmentUploadState: UploadState.NoUpload
  }

  // Handle form change begin //
  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    console.log('File change:' + files)
    if (!files) return

    console.log('Set vAttachmentFile:' + files[0])
    this.setState({
      vAttachmentFile: files[0]
    })
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ vPHistName: event.target.value })
  }

  handlePurposeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ vPHistPurpose: event.target.value })
  }

  // Handle from change end //

  handleCancel = (event: React.SyntheticEvent) => {
    this.props.history.push('/vphist')
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.vPHistName) {
        alert('Please specific name!')
        return
      }
      if (!this.state.vPHistPurpose) {
        alert('Please specific purpose!')
        return
      }

      await patchVPHist(this.props.auth.getIdToken(), 
        this.props.match.params.historyId, 
        { name: this.state.vPHistName, purpose: this.state.vPHistPurpose
        })

      console.log('The VPHist was created with historyId:' + this.props.match.params.historyId 
        + ', continue to upload file :' + this.state.vAttachmentFile)

      if (this.state.vAttachmentFile) {
        this.uploadAttachmentFile()
      }else{
        this.props.history.push('/vphist')
      }

      alert('The VPHist updated.')

    } catch (e) {
      alert('Could not create a VPHist: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  async uploadAttachmentFile () {
    try {
      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), 
        this.props.match.params.historyId)

      console.log('Upload file ' + this.state.vAttachmentFile + ' to URL ' + uploadUrl)

      this.setUploadState(UploadState.UploadingFile)
      uploadFile(uploadUrl, this.state.vAttachmentFile)

      console.log('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }

    this.props.history.push('/vphist')
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      attachmentUploadState: uploadState
    })
  }

  render() {
    return (
      <div>
        {this.renderForm()}
      </div>
    )
  }

  renderForm() {
    return (
      <div>
        <h1>Edit Checked-In</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Place name</label>
            <input
              type="text"
              name="name"
              value={this.state.vPHistName}
              onChange={this.handleNameChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Purpose</label>
            <input
              type="text"
              name="purpose"
              value={this.state.vPHistPurpose}
              onChange={this.handlePurposeChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Attachment Image(Optional)</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Upload the attachment file"
              onChange={this.handleFileChange}
            />
          </Form.Field>
          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {
    return (
      <div>
        <Button
          loading={this.state.attachmentUploadState !== UploadState.NoUpload}
          type="button"
          onClick={this.handleCancel}
        >
          Cancel
        </Button>
        <Button
          loading={this.state.attachmentUploadState !== UploadState.NoUpload}
          type="submit"
        >
          Update
        </Button>
      </div>
    )
  }
}
