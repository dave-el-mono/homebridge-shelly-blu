/* eslint-disable max-len */
import { PlatformAccessory } from 'homebridge';

import { ShellyBluPlatform } from '../platform';
import BaseAccessory from './BaseAccessory';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SBDWAccessory extends BaseAccessory{

  constructor(
    private readonly platform: ShellyBluPlatform,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    device: any,
    platformAccessory?: PlatformAccessory,
  ) {

    super();

    if (!platformAccessory) {

      const uuid = this.platform.api.hap.uuid.generate(device.uniqueId);
      this._platformAccessory = new this.platform.api.platformAccessory(device.code, uuid);
      this._platformAccessory.context.unique_id = device.uniqueId;
      this._platformAccessory.context.code = device.code;

      // set accessory information
      this._platformAccessory.getService(this.platform.Service.AccessoryInformation)!
        .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Allterco')
        .setCharacteristic(this.platform.Characteristic.Model, 'Shelly BLU Door Window')
        .setCharacteristic(this.platform.Characteristic.SerialNumber, device.uniqueId);

      if(device.payload) {
        this.updateStatus(device);
      }
    } else {
      this._platformAccessory = platformAccessory;
    }

  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateStatus(device: any) {
    this.platform.log.debug(`Update device ${device.uniqueId} status`);
    const characteristic = this.platform.api.hap.Characteristic;

    const _device = {
      uniqueId: device.uniqueId,
      code: device.code,
      contactSensorState: device.payload['window:0'].open ? characteristic.ContactSensorState.CONTACT_NOT_DETECTED : characteristic.ContactSensorState.CONTACT_DETECTED,
      // eslint-disable-next-line max-len
      statusLowBattery: device.payload['devicepower:0'].battery.percent < 10 ? characteristic.StatusLowBattery.BATTERY_LEVEL_LOW : characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL,
    };
    this.platform.log.debug('%j', _device);

    const primaryService = this._platformAccessory.getService(this.platform.Service.ContactSensor) ||
          this._platformAccessory.addService(this.platform.Service.ContactSensor);
    primaryService.getCharacteristic(this.platform.Characteristic.ContactSensorState).setValue(_device.contactSensorState);
    primaryService.getCharacteristic(this.platform.Characteristic.StatusLowBattery).setValue(_device.statusLowBattery);

  }

}
