import { create } from 'zustand'
import { getConfigs as apiGetConfigs, createConfig as apiCreateConfig, updateConfig as apiUpdateConfig, deleteConfig as apiDeleteConfig } from '../services/api'

function loadSavedBuilds() {
  try {
    return JSON.parse(localStorage.getItem('drone-builds') || '[]')
  } catch {
    return []
  }
}

function loadFleets() {
  try {
    return JSON.parse(localStorage.getItem('drone-fleets') || '[]')
  } catch {
    return []
  }
}

function persistFleets(fleets) {
  localStorage.setItem('drone-fleets', JSON.stringify(fleets))
}

function persistBuilds(builds) {
  localStorage.setItem('drone-builds', JSON.stringify(builds))
}

function hasToken() {
  return !!localStorage.getItem('drone-auth-token')
}

function calcDailyRate(totalCost) {
  return Math.round(totalCost * 0.08)
}

let fleetCounter = Date.now()

export const useDroneStore = create((set, get) => ({
  parts: {
    frame: { name: 'X8 Carbon', price: 199, weight: 220 },
    battery: { name: '6S 5200mAh', price: 89, weight: 380, flight: 360 },
    camera: { name: '4K 60fps', price: 149, weight: 85 },
    motor: { name: 'R-Link 2207', price: 120, weight: 128 },
    props: { name: '5" Freestyle', price: 19, weight: 28 },
  },

  colors: {
    frame: 'carbon',
    accent: 'orange',
  },

  buildName: 'Vigilante X8',
  buildType: 'Drone de vigilância',
  missionType: 'vigilancia',
  savedBuilds: loadSavedBuilds(),
  fleets: loadFleets(),
  editingBuildId: null,

  // Fleet actions
  createFleet: (name, description = '') => {
    const { fleets } = get()
    const newFleet = {
      id: ++fleetCounter,
      name,
      description,
      createdAt: new Date().toISOString(),
    }
    const updated = [...fleets, newFleet]
    persistFleets(updated)
    set({ fleets: updated })
    return newFleet
  },

  deleteFleet: (fleetId) => {
    const { fleets, savedBuilds } = get()
    const fleetStr = String(fleetId)
    const updatedFleets = fleets.filter(f => String(f.id) !== fleetStr)
    const updatedBuilds = savedBuilds.map(b =>
      String(b.fleetId) === fleetStr ? { ...b, fleetId: null } : b
    )
    persistFleets(updatedFleets)
    persistBuilds(updatedBuilds)
    set({ fleets: updatedFleets, savedBuilds: updatedBuilds })
  },

  renameFleet: (fleetId, name) => {
    const { fleets } = get()
    const fleetStr = String(fleetId)
    const updated = fleets.map(f =>
      String(f.id) === fleetStr ? { ...f, name } : f
    )
    persistFleets(updated)
    set({ fleets: updated })
  },

  addToFleet: (buildId, fleetId) => {
    const { savedBuilds } = get()
    const buildStr = String(buildId)
    const updated = savedBuilds.map(b => {
      if (String(b.id) === buildStr || String(b._id || '') === buildStr) {
        if (hasToken() && b._id) {
          apiUpdateConfig(b._id, { fleetId }).catch(() => {})
        }
        return { ...b, fleetId }
      }
      return b
    })
    persistBuilds(updated)
    set({ savedBuilds: updated })
  },

  removeFromFleet: (buildId) => {
    const { savedBuilds } = get()
    const buildStr = String(buildId)
    const updated = savedBuilds.map(b => {
      if (String(b.id) === buildStr || String(b._id || '') === buildStr) {
        if (hasToken() && b._id) {
          apiUpdateConfig(b._id, { fleetId: null }).catch(() => {})
        }
        return { ...b, fleetId: null }
      }
      return b
    })
    persistBuilds(updated)
    set({ savedBuilds: updated })
  },

  addCatalogToFleet: (droneData, fleetId) => {
    const { savedBuilds } = get()
    const catMissionMap = { vigilancia: 'vigilancia', agricultura: 'agricultura', geo: 'mapeamento', industrial: 'industrial' }
    const missionType = (droneData.categories || [])
      .map((c) => catMissionMap[c])
      .find(Boolean) || 'outro'

    const newBuild = {
      id: Date.now(),
      name: droneData.name,
      parts: {},
      prices: {},
      catalogId: droneData.id,
      missionType,
      total: parseInt(droneData.price.replace(/[^0-9]/g, '')),
      date: new Date().toISOString(),
      fleetId,
    }
    const updated = [...savedBuilds, newBuild]
    persistBuilds(updated)
    set({ savedBuilds: updated })
    return newBuild
  },

  fetchConfigs: async () => {
    if (!hasToken()) return
    try {
      const { data } = await apiGetConfigs()
      const { savedBuilds: localBuilds } = get()
      const serverIds = new Set(data.map(cfg => cfg._id))
      const merged = [
        ...data.map((cfg) => ({
          _id: cfg._id,
          id: cfg._id,
          name: cfg.name,
          missionType: cfg.missionType || 'outro',
          parts: Object.keys(cfg.parts).reduce((acc, key) => {
            acc[key] = cfg.parts[key].name
            return acc
          }, {}),
          prices: Object.keys(cfg.parts).reduce((acc, key) => {
            acc[key] = cfg.parts[key].price
            return acc
          }, {}),
          colors: cfg.colors,
          total: cfg.total,
          dailyRate: cfg.dailyRate || 0,
          date: cfg.createdAt,
          fleetId: cfg.fleetId || null,
        })),
        ...localBuilds.filter(b => !serverIds.has(b._id) && !serverIds.has(b.id)),
      ]
      set({ savedBuilds: merged })
      persistBuilds(merged)
    } catch {
      // Fallback to localStorage
    }
  },

  setPart: (category, partInfo) => set((state) => {
    const updatedParts = {
      ...state.parts,
      [category]: partInfo
    }
    return { parts: updatedParts }
  }),

  setColors: (type, color) => set((state) => ({
    colors: {
      ...state.colors,
      [type]: color
    }
  })),

  setBuildName: (name) => set({ buildName: name }),
  setBuildType: (type) => set({ buildType: type }),
  setMissionType: (type) => set({ missionType: type }),

  getCalculations: () => {
    const { parts } = get()
    const totalWeight = Object.values(parts).reduce((sum, part) => sum + (part.weight || 0), 0)
    const totalPrice = Object.values(parts).reduce((sum, part) => sum + (part.price || 0), 0)
    const flightTime = parts.battery?.flight || 90
    return {
      totalWeightGrams: totalWeight,
      totalWeightKg: (totalWeight / 1000).toFixed(1),
      totalPrice,
      dailyRate: calcDailyRate(totalPrice),
      flightTime,
    }
  },

  duplicateBuild: (build) => {
    const { savedBuilds } = get()
    const duplicate = {
      ...build,
      id: Date.now(),
      name: `${build.name} (cópia)`,
      date: new Date().toISOString()
    }
    const updatedBuilds = [...savedBuilds, duplicate]
    persistBuilds(updatedBuilds)
    set({ savedBuilds: updatedBuilds })
    return duplicate
  },

  resetEditing: () => set({ editingBuildId: null }),

  saveCurrentBuild: async (fleetId = null) => {
    const { parts, colors, buildName, missionType, savedBuilds, editingBuildId } = get()
    const { totalPrice, dailyRate } = get().getCalculations()

    const buildData = {
      name: buildName,
      missionType,
      parts: Object.keys(parts).reduce((acc, key) => {
        acc[key] = parts[key].name
        return acc
      }, {}),
      prices: Object.keys(parts).reduce((acc, key) => {
        acc[key] = parts[key].price
        return acc
      }, {}),
      colors,
      total: totalPrice,
      dailyRate,
      date: new Date().toISOString(),
      fleetId,
    }

    let savedBuild
    let updatedBuilds

    if (editingBuildId) {
      // Update existing build
      updatedBuilds = savedBuilds.map((b) => {
        const match = String(b.id) === String(editingBuildId) || String(b._id || '') === String(editingBuildId)
        if (match) {
          savedBuild = { ...b, ...buildData }
          return savedBuild
        }
        return b
      })
    } else {
      // Create new build
      savedBuild = { id: Date.now(), ...buildData }
      updatedBuilds = [...savedBuilds, savedBuild]
    }

    persistBuilds(updatedBuilds)
    set({ savedBuilds: updatedBuilds, editingBuildId: null })

    if (hasToken()) {
      try {
        const fullParts = {
          frame: { name: parts.frame.name, price: parts.frame.price, weight: parts.frame.weight },
          battery: { name: parts.battery.name, price: parts.battery.price, weight: parts.battery.weight, flight: parts.battery.flight },
          camera: { name: parts.camera.name, price: parts.camera.price, weight: parts.camera.weight },
          motor: { name: parts.motor.name, price: parts.motor.price, weight: parts.motor.weight },
          props: { name: parts.props.name, price: parts.props.price, weight: parts.props.weight }
        }
        const payload = {
          name: buildName,
          parts: fullParts,
          colors,
          total: totalPrice,
          dailyRate,
          missionType,
          fleetId,
        }

        if (savedBuild?._id) {
          await apiUpdateConfig(savedBuild._id, payload)
        } else {
          const { data } = await apiCreateConfig(payload)
          const finalBuilds = get().savedBuilds.map((b) =>
            (String(b.id) === String(savedBuild.id) || String(b._id || '') === String(savedBuild.id))
              ? { ...b, _id: data._id, id: data._id }
              : b
          )
          persistBuilds(finalBuilds)
          set({ savedBuilds: finalBuilds })
        }
      } catch {
        // Silent fail - build is saved locally
      }
    }

    return savedBuild
  },

  loadBuild: (buildId) => {
    const { savedBuilds } = get()
    const buildStr = String(buildId)
    const build = savedBuilds.find((b) => String(b.id) === buildStr || String(b._id || '') === buildStr)
    if (!build) return false

    const weightMap = {
      frame: { 'X8 Carbon': 220, 'X8 Carbon Pro': 195, 'Nano Carbon': 80, 'Race X5': 140 },
      battery: { '6S 5200mAh': 380, '6S 4200mAh': 320, '4S 2200mAh': 190, '4S 1800mAh': 160 },
      camera: { '4K 60fps': 85, '6K Cinema': 140, '1080p 120fps': 45, 'Térmica + 4K': 210 },
      motor: { 'R-Link 2207': 128, 'Pro 2208': 144, 'Sprint 2306': 120, 'Cruise 2806': 160 },
      props: { '5" Freestyle': 28, '7" Endurance': 36, 'Dobráveis': 32, '3" Racing': 20 }
    }

    const flightMap = {
      '6S 5200mAh': 360, '6S 4200mAh': 240, '4S 2200mAh': 150, '4S 1800mAh': 90
    }

    const mappedParts = {}
    Object.keys(build.parts).forEach((category) => {
      const name = build.parts[category]
      const price = build.prices[category]
      const weight = weightMap[category]?.[name] || 0
      const flight = category === 'battery' ? (flightMap[name] || 90) : undefined
      mappedParts[category] = { name, price, weight, flight }
    })

    set({
      parts: mappedParts,
      colors: build.colors,
      buildName: build.name,
      buildType: build.buildType || '',
      missionType: build.missionType || 'outro',
      editingBuildId: buildId,
    })
    return true
  },

  deleteBuild: (buildId) => {
    try {
      const { savedBuilds } = get()
      const buildStr = buildId != null ? String(buildId) : ''
      if (!buildStr) return

      const buildToRemove = savedBuilds.find((b) =>
        (b.id != null && String(b.id) === buildStr) ||
        (b._id != null && String(b._id) === buildStr)
      )
      if (!buildToRemove) return

      const updatedBuilds = savedBuilds.filter((b) => b !== buildToRemove)
      persistBuilds(updatedBuilds)
      const editingCleared = String(get().editingBuildId) === buildStr ? { editingBuildId: null } : {}
      set({ savedBuilds: updatedBuilds, ...editingCleared })

      if (hasToken() && buildToRemove._id) {
        apiDeleteConfig(buildToRemove._id).catch(() => {})
      }
    } catch (e) {
      console.error('deleteBuild error:', e)
    }
  }
}))
