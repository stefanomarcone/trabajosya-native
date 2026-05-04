import { View, Text } from 'react-native'
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps'
import type { Job } from '../types'

const SANTIAGO = { lat: -33.4489, lng: -70.6693 }

const CATEGORY_COLORS: Record<string, string> = {
  'Pintura': '#3b82f6',
  'Plomería': '#0ea5e9',
  'Electricidad': '#f59e0b',
  'Jardinería': '#22c55e',
  'Limpieza': '#8b5cf6',
  'Mudanzas': '#f97316',
  'Fletes': '#ef4444',
  'Mantención': '#6b7280',
  'Apoyo en cocina': '#ec4899',
  'Asistencia General': '#8b5cf6',
  'Otros': '#6b7280',
}

/** Deterministic fuzz to hide exact location (~1.5km radius) */
function fuzzCoords(lat: number, lng: number, jobId: string): { latitude: number; longitude: number } {
  let hash = 0
  for (let i = 0; i < jobId.length; i++) {
    hash = ((hash << 5) - hash + jobId.charCodeAt(i)) | 0
  }
  const r1 = ((hash & 0xffff) / 0xffff - 0.5) * 2
  const r2 = (((hash >> 16) & 0xffff) / 0xffff - 0.5) * 2
  const off = 0.0135
  return { latitude: lat + r1 * off, longitude: lng + r2 * off }
}

interface Props {
  jobs: Job[]
  onJobClick?: (job: Job) => void
  dark?: boolean
}

export default function JobsMap({ jobs, onJobClick, dark }: Props) {
  return (
    <View
      style={{
        height: 320,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: dark ? '#1f2937' : '#e5e7eb',
      }}
    >
      <MapView
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: SANTIAGO.lat,
          longitude: SANTIAGO.lng,
          latitudeDelta: 0.18,
          longitudeDelta: 0.18,
        }}
      >
        {jobs.map((job) => {
          const lat = (job as any).location_lat ?? SANTIAGO.lat
          const lng = (job as any).location_lng ?? SANTIAGO.lng
          const coords = fuzzCoords(lat, lng, job.id)
          const color = CATEGORY_COLORS[job.category] || '#6b7280'
          return (
            <Marker
              key={job.id}
              coordinate={coords}
              pinColor={color}
              title={job.category}
              description={job.description?.slice(0, 60)}
              onCalloutPress={() => onJobClick?.(job)}
            />
          )
        })}
      </MapView>
      {jobs.length === 0 && (
        <View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: dark ? 'rgba(17,24,39,0.7)' : 'rgba(255,255,255,0.7)',
          }}
        >
          <Text style={{ color: dark ? '#9ca3af' : '#6b7280', fontSize: 13 }}>
            No hay trabajos en el área
          </Text>
        </View>
      )}
    </View>
  )
}
