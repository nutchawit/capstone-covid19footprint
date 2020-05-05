import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createVPHist, deleteVPHist, getVPHist, patchVPHist } from '../api/vphist-api'
import Auth from '../auth/Auth'
import { VPHist } from '../types/VPHist'

interface VPHistProps {
  auth: Auth
  history: History
}

interface VPHistState {
  vPHist: VPHist[]
  newVPHistName: string
  newVPHistPurpose: string
  newVPHistCoordinateLat: string
  newVPHistCoordinateLng: string
  loadingVPHist: boolean
}

export class VPHists extends React.PureComponent<VPHistProps, VPHistState> {
  state: VPHistState = {
    vPHist: [],
    newVPHistName: '',
    newVPHistPurpose: '',
    newVPHistCoordinateLat: '',
    newVPHistCoordinateLng: '',
    loadingVPHist: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newVPHistName: event.target.value })
  }

  onEditButtonClick = (historyId: string) => {
    this.props.history.push(`/vphist/${historyId}/edit`)
  }

  onCreateButtonClick = () => {
    this.props.history.push(`/vphist/add`)
  }

  onVPHistCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newVPHist = await createVPHist(this.props.auth.getIdToken(), {
        name: this.state.newVPHistName,
        purpose: this.state.newVPHistPurpose,
        coordinateLat: this.state.newVPHistCoordinateLat,
        coordinateLng: this.state.newVPHistCoordinateLng,
      })
      this.setState({
        vPHist: [...this.state.vPHist, newVPHist],
        newVPHistName: '',
        newVPHistPurpose: '',
        newVPHistCoordinateLat: '',
        newVPHistCoordinateLng: ''
      })
    } catch {
      alert('[onVPHistCreate] HPHist creation failed')
    }
  }

  onVPHistDelete = async (historyId: string) => {
    try {
      await deleteVPHist(this.props.auth.getIdToken(), historyId)
      this.setState({
        vPHist: this.state.vPHist.filter(vph => vph.historyId != historyId)
      })
    } catch {
      alert('[onVPHistDelete] VPHist deletion failed')
    }
  }

  onVPHistCheck = async (pos: number) => {
    try {
      const vph = this.state.vPHist[pos]
      await patchVPHist(this.props.auth.getIdToken(), vph.historyId, {
        name: vph.name,
        purpose: vph.purpose,
        coordinateLat: vph.coordinateLat,
        coordinateLng: vph.coordinateLng
      })
      this.setState({
        vPHist: update(this.state.vPHist, {
          [pos]: { name: { $set: vph.name } }
        })
      })
    } catch {
      alert('[onVPHistCheck] VPHist deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const vPHist = await getVPHist(this.props.auth.getIdToken())
      this.setState({
        vPHist,
        loadingVPHist: false
      })
    } catch (e) {
      alert(`Failed to fetch VPHist: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Visited Place History</Header>

        {this.renderCreateVPHistInput()}

        {this.renderVPHistList()}
      </div>
    )
  }

  renderCreateVPHistInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Button
            icon
            color="green"
            onClick={() => this.onCreateButtonClick()}
            >
            <Icon name="pencil" />
          </Button>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderVPHist() {
    if (this.state.loadingVPHist) {
      return this.renderLoading()
    }

    return this.renderVPHistList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading VPHist(s)...
        </Loader>
      </Grid.Row>
    )
  }

  renderVPHistList() {
    return (
      <Grid padded>
        {this.state.vPHist.map((vph, pos) => {
          return (
            <Grid.Row key={vph.historyId}>
              <Grid.Column width={2} verticalAlign="middle">
                {vph.createdAt}
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle">
                {vph.name}
              </Grid.Column>
              <Grid.Column width={10} floated="left">
                {vph.purpose}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(vph.historyId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onVPHistDelete(vph.historyId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {vph.attachmentUrl && (
                <Image src={vph.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
