import { apiEndpoint } from '../config'
import { VPHist } from '../types/VPHist';
import { CreateVPHistRequest } from '../types/CreateVPHistRequest';
import Axios from 'axios'
import { UpdateVPHistRequest } from '../types/UpdateVPHistRequest';

export async function getVPHist(idToken: string): Promise<VPHist[]> {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/vphist`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('VPHist:', response.data)
  return response.data.items
}

export async function createVPHist(
  idToken: string,
  newVPHist: CreateVPHistRequest
): Promise<VPHist> {
  const response = await Axios.post(`${apiEndpoint}/vphist`,  JSON.stringify(newVPHist), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchVPHist(
  idToken: string,
  historyId: string,
  updatedVPHist: UpdateVPHistRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/vphist/${historyId}`, JSON.stringify(updatedVPHist), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteVPHist(
  idToken: string,
  historyId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/vphist/${historyId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  historyId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/vphist/${historyId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      'Access-Control-Allow-Origin': '*'
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
