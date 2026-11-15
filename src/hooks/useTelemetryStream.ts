import { useMissionStore } from '@/store/useMissionStore';

export function useTelemetryStream() {
  const telemetry = useMissionStore((state) => state.telemetry);
  const mission = useMissionStore((state) => state.mission);

  return {
    telemetry,
    mission,
    metSeconds: telemetry.metSeconds,
    missionDay: telemetry.missionDay,
    atmosphere: telemetry.atmosphere,
    power: telemetry.power,
    lifeSupport: telemetry.lifeSupport,
    comms: telemetry.comms,
    environment: telemetry.environment,
    masterAlarm: telemetry.masterAlarm,
  };
}
