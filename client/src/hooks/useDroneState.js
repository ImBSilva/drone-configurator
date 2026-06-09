import { useMemo } from 'react'
import { useDroneStore } from '../store/droneStore'

export function useDroneState() {
  const parts = useDroneStore((state) => state.parts)
  const colors = useDroneStore((state) => state.colors)
  const buildName = useDroneStore((state) => state.buildName)
  const buildType = useDroneStore((state) => state.buildType)
  const missionType = useDroneStore((state) => state.missionType)
  const savedBuilds = useDroneStore((state) => state.savedBuilds)

  const setPart = useDroneStore((state) => state.setPart)
  const setColors = useDroneStore((state) => state.setColors)
  const setBuildName = useDroneStore((state) => state.setBuildName)
  const setBuildType = useDroneStore((state) => state.setBuildType)
  const setMissionType = useDroneStore((state) => state.setMissionType)
  const saveCurrentBuild = useDroneStore((state) => state.saveCurrentBuild)
  const loadBuild = useDroneStore((state) => state.loadBuild)
  const deleteBuild = useDroneStore((state) => state.deleteBuild)
  const duplicateBuild = useDroneStore((state) => state.duplicateBuild)
  const fetchConfigs = useDroneStore((state) => state.fetchConfigs)

  const calcs = useMemo(() => {
    const totalWeight = Object.values(parts).reduce((sum, part) => sum + (part.weight || 0), 0)
    const totalPrice = Object.values(parts).reduce((sum, part) => sum + (part.price || 0), 0)
    const flightTime = parts.battery?.flight || 90
    const dailyRate = Math.round(totalPrice * 0.08)
    return {
      totalWeightGrams: totalWeight,
      totalWeightKg: (totalWeight / 1000).toFixed(1),
      totalPrice,
      dailyRate,
      flightTime,
    }
  }, [parts])

  return {
    parts,
    colors,
    buildName,
    buildType,
    missionType,
    savedBuilds,
    setPart,
    setColors,
    setBuildName,
    setBuildType,
    setMissionType,
    saveCurrentBuild,
    loadBuild,
    deleteBuild,
    duplicateBuild,
    fetchConfigs,
    calcs,
  }
}
