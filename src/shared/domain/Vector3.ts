export class Vector3 {
  constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}

  add(v: Vector3): Vector3 {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z)
  }

  sub(v: Vector3): Vector3 {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z)
  }

  multiplyScalar(s: number): Vector3 {
    return new Vector3(this.x * s, this.y * s, this.z * s)
  }

  lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z
  }

  length(): number {
    return Math.sqrt(this.lengthSq())
  }

  normalize(): Vector3 {
    const len = this.length()
    if (len === 0) return new Vector3(0, 0, 0)
    return this.multiplyScalar(1 / len)
  }

  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z)
  }
}
