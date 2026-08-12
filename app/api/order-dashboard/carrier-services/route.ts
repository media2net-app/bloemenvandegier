import { NextResponse } from 'next/server'
import {
  carrierOptionsFromApi,
  DEFAULT_CARRIER_OPTIONS,
  listCarrierServices,
} from '@/lib/pakketpartner/carriers'
import { PakketpartnerApiError } from '@/lib/pakketpartner/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const services = await listCarrierServices()
    return NextResponse.json({
      options: carrierOptionsFromApi(services),
      services,
    })
  } catch (error) {
    if (error instanceof PakketpartnerApiError) {
      return NextResponse.json(
        { options: DEFAULT_CARRIER_OPTIONS, error: error.message },
        { status: 200 }
      )
    }
    return NextResponse.json(
      {
        options: DEFAULT_CARRIER_OPTIONS,
        error: error instanceof Error ? error.message : 'Vervoerders laden mislukt',
      },
      { status: 200 }
    )
  }
}
