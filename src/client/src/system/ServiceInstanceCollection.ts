import { ServiceInstanceStatus, ServiceStatus } from 'rt-types'

export class ServiceInstanceCollection {
  private readonly serviceMap: Map<string, ServiceInstanceStatus> = new Map()

  constructor(public readonly serviceType: string) {}

  update(update: ServiceInstanceStatus) {
    this.serviceMap.set(update.serviceId, update)
    return this
  }

  getServiceInstances() {
    return Array.from(this.serviceMap.values())
  }

  getServiceWithMinLoad() {
    return this.getServiceInstances()
      .filter(x => x.isConnected)
      .sort((x, y) => x.serviceLoad - y.serviceLoad)[0]
  }

  get(serviceInstance: string) {
    return this.serviceMap.get(serviceInstance)
  }
}

export class ServiceCollectionMap {
  private readonly serviceInstanceCollections = new Map<string, ServiceInstanceCollection>()

  add(service: string, serviceInstanceCollection: ServiceInstanceCollection) {
    this.serviceInstanceCollections.set(service, serviceInstanceCollection)
    return this
  }

  has(service: string) {
    return this.serviceInstanceCollections.has(service)
  }

  get(service: string) {
    return this.serviceInstanceCollections.get(service)
  }

  getServiceInstanceStatus(type: string, instance: string) {
    if (this.serviceInstanceCollections.has(type)) {
      return this.serviceInstanceCollections.get(type)!.get(instance)
    }

    return undefined
  }

  getServiceInstanceWithMinimumLoad(serviceType: string) {
    const x = this.serviceInstanceCollections.get(serviceType)

    if (x) {
      return x.getServiceWithMinLoad()
    }

    return undefined
  }

  getStatusOfServices(): ServiceConnectionInfo {
    return Array.from(this.serviceInstanceCollections.values()).reduce<ServiceConnectionInfo>((acc, next) => {
      acc[next.serviceType] = {
        serviceType: next.serviceType,
        connectedInstanceCount: next.getServiceInstances().filter(instance => instance.isConnected === true).length,
        isConnected: !!next.getServiceWithMinLoad()
      }
      return acc
    }, {})
  }
}

export interface ServiceConnectionInfo {
  [key: string]: ServiceStatus
}
