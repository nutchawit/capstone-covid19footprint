import * as React from 'react'
import { History } from 'history'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { VPHist } from '../types/VPHist';
import { createVPHist, getUploadUrl, uploadFile } from '../api/vphist-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface AddVPHistProps {
  match: {
    params: {
      historyId: string
    }
  }
  auth: Auth
  history: History
}

interface AddVPHistState {
  createdVPHist: any
  vPHistName: string
  vPHistPurpose: string
  vPHistCoordinateLat: string
  vPHistCoordinateLng: string
  vAttachmentFile: any
  attachmentUploadState: UploadState
}

export class AddVPHist extends React.PureComponent<
  AddVPHistProps,
  AddVPHistState
> {
  state: AddVPHistState = {
    createdVPHist: undefined,
    vPHistName: '',
    vPHistPurpose: '',
    vPHistCoordinateLat: '',
    vPHistCoordinateLng: '',
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

  handleVPHistCoordinateLatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ vPHistCoordinateLat: event.target.value })
  }

  handleVPHistCoordinateLngChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ vPHistCoordinateLng: event.target.value })
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
      if (!this.state.vPHistCoordinateLat) {
        alert('Please specific coordinate latitude!')
        return
      }
      if (!this.state.vPHistCoordinateLng) {
        alert('Please specific coordinate longitude!')
        return
      }

      const newVPHist = await createVPHist(this.props.auth.getIdToken(), {
        name: this.state.vPHistName,
        purpose: this.state.vPHistPurpose,
        coordinateLat: this.state.vPHistCoordinateLat,
        coordinateLng: this.state.vPHistCoordinateLng,
      })

      this.setState({
        createdVPHist: newVPHist
      })

      console.log('The VPHist was created with historyId:' + this.state.createdVPHist.historyId + ', continue to upload file :' + this.state.vAttachmentFile)

      if (this.state.vAttachmentFile) {
        this.uploadAttachmentFile()
      }

      alert('The VPHist created.')

      //this.props.history.push('/vphist')
    } catch (e) {
      alert('Could not create a VPHist: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  async uploadAttachmentFile () {
    try {
      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.state.createdVPHist.historyId)

      console.log('Upload file ' + this.state.vAttachmentFile + ' to URL ' + uploadUrl)

      this.setUploadState(UploadState.UploadingFile)
      uploadFile(uploadUrl, this.state.vAttachmentFile)

      console.log('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
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
        <h1>Checked-In</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Place name</label>
            <input
              type="text"
              name="name"
              onChange={this.handleNameChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Purpose</label>
            <input
              type="text"
              name="purpose"
              onChange={this.handlePurposeChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Attachment File(Optional)</label>
            <input
              type="file"
              accept="*"
              placeholder="Upload the attachment file"
              onChange={this.handleFileChange}
            />
          </Form.Field>
          <Form.Field>
            <label>CoordinateLat</label>
            <input
              type="number"
              name="coordinateLat"
              onChange={this.handleVPHistCoordinateLatChange}
            />
          </Form.Field>
          <Form.Field>
            <label>CoordinateLng</label>
            <input
              type="number"
              name="coordinateLng"
              onChange={this.handleVPHistCoordinateLngChange}
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
          Save
        </Button>
      </div>
    )
  }
}
