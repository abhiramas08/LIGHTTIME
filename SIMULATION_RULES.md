# LIGHTTIME: Educational Simulation Engine Rules & Mathematical Solvers

This specification articulates every mathematical relationship, biological consumption equation, life-support coupling, power balance law, and deterministic tick order implemented in the pure TypeScript LIGHTTIME simulation engine.

---

## 1. Single Documented Simulation Tick Order

Every discrete simulation tick advances connected systems in strict deterministic sequence. This guarantees causal consistency across dependent subsystems:

```
[ Stage 01: Time Stepper ]        advanceMissionTime()
         │                          • Increments elapsedHours by Δt
         │                          • Calculates missionDay = ⌊elapsedHours / 24⌋ + 1
         ▼
[ Stage 02: Environment ]         simulateEnvironment()
         │                          • Calculates solar grazing illumination & surface temp
         │                          • Computes speed-of-light delay τ = d / c
         │                          • Sets background GCR vs. solar particle storm flux
         ▼
[ Stage 03: Electrical Power ]    simulatePower()
         │                          • Solar array generation (solar flux × health factor)
         │                          • Surface fission Stirling generation (15 kW baseline)
         │                          • Calculates total demand from active habitat machinery
         │                          • Charges / discharges battery storage
         │                          • Establishes power satisfaction ratio R_power ∈ [0.0, 1.0]
         ▼
[ Stage 04: Equipment Status ]    simulateEquipment()
         │                          • Enforces load-shedding if battery is low (R_power < 0.65)
         │                          • Forces equipment failures if blackout occurs
         │                          • Accrues mechanical wear condition
         ▼
[ Stage 05: Oxygen Reserves ]     simulateOxygen()
         │                          • 4-crew metabolic consumption: 4 × 0.035 kg/hr × Δt
         │                          • Prevents negative inventory (clamped at 0.0 kg)
         │                          • Fires CAUTION (< 60 kg) and CRITICAL (< 18 kg) alerts
         ▼
[ Stage 06: Carbon Dioxide ]      simulateCO2Removal()
         │                          • Crew exhalation: 4 × 0.0417 kg/hr × Δt
         │                          • CDRA amine scrubbing capacity modulated by condition & R_power
         │                          • Calculates ECLSS loop closure efficiency score
         ▼
[ Stage 07: Water Reclamation ]   simulateWater()
         │                          • Crew water demand: 4 × 0.125 L/hr × Δt
         │                          • Catalytic recovery modulated by WRS condition & R_power
         │                          • Prevents negative inventory (clamped at 0.0 L)
         ▼
[ Stage 08: Food Rations ]        simulateFood()
         │                          • Caloric metabolic demand: 4 × 125 kcal/hr × Δt
         │                          • Depletes food inventory (clamped at 0.0 kcal)
         ▼
[ Stage 09: Crew Wellbeing ]      simulateCrew()
         │                          • SLEEPING: Sheds fatigue (-8.0 pts/hr) and stress (-5.0 pts/hr)
         │                          • AWAKE: Accrues fatigue (+1.25 pts/hr; 2.2× if ON_EVA)
         │                          • Life-support cascading distress: hypoxia, hypercapnia, dehydration
         │                          • Radiation accumulation (0.015 mSv/hr in habitat; 0.055 mSv/hr EVA)
         │                          • Clamps all educational indices [0.0, 100.0]
         ▼
[ Stage 10: Emergency Engine ]    processEmergencies()
         │                          • Evaluates threshold alerts (low O2, CDRA fail, blackout, flare)
         │                          • Ticks down active contingency checklist response timer
         │                          • Escalates to CRITICAL on timer expiry; clears on recovery
         ▼
[ Stage 11: Operational Status ]  evaluateMissionStatus()
         │                          • Declares COMPLETED on sol 30
         │                          • Declares ABORTED on fatal hypoxia or crew incapacitation
         ▼
[ Stage 12: Audit Records ]       recordPeriodicTelemetry()
                                    • Records historical resource and crew wellbeing points
                                    • Appends mission event log
```

---

## 2. Configurable Educational Assumptions & Rates

All default parameters are configured in [config.ts](file:///Users/neenajayan/nasaproject/src/simulation/engine/config.ts) and can be customized per curriculum:

| Parameter | Default Value | SI / Unit | Pedagogical Context |
| :--- | :--- | :--- | :--- |
| `oxygenConsumptionRatePerCrewKgPerHour` | `0.035` | $\text{kg/hr}$ | $0.84\text{ kg/sol}$ per astronaut ($3.36\text{ kg/sol}$ habitat total) |
| `co2ExhalationRatePerCrewKgPerHour` | `0.0417` | $\text{kg/hr}$ | $1.00\text{ kg/sol}$ per astronaut ($4.00\text{ kg/sol}$ habitat total) |
| `waterConsumptionRatePerCrewLitersPerHour` | `0.125` | $\text{L/hr}$ | $3.00\text{ L/sol}$ per astronaut ($12.00\text{ L/sol}$ habitat total) |
| `foodConsumptionRatePerCrewKcalPerHour` | `125.0` | $\text{kcal/hr}$ | $3,000\text{ kcal/sol}$ per astronaut ($12,000\text{ kcal/sol}$ habitat total) |
| `baseWaterRecoveryRate` | `0.934` | Ratio | $93.4\%$ catalytic urine processor & condenser efficiency |
| `nominalCo2RemovalCapacityKgPerHour` | `0.28` | $\text{kg/hr}$ | Primary Amine CDRA bed scrubbing capacity |
| `baseSolarGenerationPeakKw` | `45.0` | $\text{kW}$ | Peak daylight tracking photovoltaic output |
| `baseNuclearGenerationKw` | `15.0` | $\text{kW}$ | Continuous Stirling surface fission micro-reactor |
| `baseHabitatPowerDemandKw` | `28.0` | $\text{kW}$ | Baseline life-support pumps, fans, and avionics load |
| `batteryCapacityKwh` | `200.0` | $\text{kWh}$ | Regenerative fuel cell / Li-ion storage bank |
| `fatigueAccumulationRatePerHour` | `1.25` | $\text{pts/hr}$ | Wakefulness fatigue accretion rate |
| `fatigueRecoveryRatePerSleepHour` | `8.0` | $\text{pts/hr}$ | Circadian sleep restoration rate |
| `evaWorkloadFatigueMultiplier` | `2.2` | Factor | Surface EVA physical exertion fatigue multiplier |

---

## 3. Mathematical Equations of System Dependencies

### 3.1 Electrical Power Generation & Storage
$$\begin{aligned}
P_{\text{solar}}(t) &= P_{\text{peak}} \times \left(\frac{I_{\text{lunar}}(t)}{100}\right) \times \left(\frac{C_{\text{solar}}}{100}\right) \\
P_{\text{fission}}(t) &= P_{\text{reactor\_base}} \times \left(\frac{C_{\text{reactor}}}{100}\right) \\
P_{\text{gen}}(t) &= P_{\text{solar}}(t) + P_{\text{fission}}(t) \\
P_{\text{demand}}(t) &= P_{\text{hab\_base}} + \sum_{i \in \text{active}} P_{\text{equipment}, i} \\
\Delta P(t) &= P_{\text{gen}}(t) - P_{\text{demand}}(t)
\end{aligned}$$

Battery Charge/Discharge:
$$E_{\text{batt}}(t + \Delta t) = \begin{cases}
\min\left(E_{\text{cap}}, E_{\text{batt}}(t) + \Delta P \cdot \Delta t \times 0.95\right), & \Delta P \ge 0 \\
\max\left(0, E_{\text{batt}}(t) + \Delta P \cdot \Delta t\right), & \Delta P < 0
\end{cases}$$

Power Satisfaction Ratio $R_{\text{power}} \in [0.0, 1.0]$:
$$R_{\text{power}} = \begin{cases}
1.0, & \Delta P \ge 0 \text{ or } E_{\text{batt}} > 0 \\
\max\left(0, \frac{P_{\text{gen}}}{P_{\text{demand}}}\right), & E_{\text{batt}} = 0 \text{ and } \Delta P < 0
\end{cases}$$

### 3.2 Cascading Life Support Coupling
* When $R_{\text{power}} < 0.65$, non-essential airlock pumps shift to `STANDBY`.
* If power fails entirely ($E_{\text{batt}} = 0$ and $P_{\text{gen}} < P_{\text{demand}}$):
  $$C_{\text{CDRA, effective}} = C_{\text{nominal}} \times \left(\frac{\text{condition}}{100}\right) \times R_{\text{power}}$$
* When $C_{\text{CDRA, effective}} < \dot{m}_{CO_2, \text{exhaled}}$, carbon dioxide builds up in the habitat cabin volume.

### 3.3 Crew Stress & Cognitive Readiness Cascades
$$\begin{aligned}
\text{Fatigue}(t + \Delta t) &= \begin{cases}
\max\left(0, \text{Fatigue}(t) - 8.0 \cdot \Delta t\right), & \text{if SLEEPING} \\
\min\left(100, \text{Fatigue}(t) + 1.25 \cdot \Delta t \cdot \mu_{\text{EVA}} + \Delta F_{\text{hazard}}\right), & \text{if AWAKE}
\end{cases} \\
\text{Stress}(t + \Delta t) &= \begin{cases}
\max\left(0, \text{Stress}(t) - 5.0 \cdot \Delta t\right), & \text{if SLEEPING} \\
\min\left(100, \text{Stress}(t) + 0.2 \cdot \Delta t + \Delta S_{\text{life\_support}}\right), & \text{if AWAKE}
\end{cases}
\end{aligned}$$

Where:
* If oxygen inventory $= 0\text{ kg}$: $\Delta S = +30\text{ pts/hr}$, SpO₂ drops by $-15\%/\text{hr}$, heart rate surges $+25\text{ BPM/hr}$.
* If radiation index $> 50$: astronaut cumulative radiation dose accrues at $+0.85\text{ mSv/hr}$.
* If fatigue $> 90$ or SpO₂ $< 85\%$ or cumulative dose $> 250\text{ mSv}$: astronaut status shifts to `MEDICAL_RESTRICTED`.

---

## 4. Physical Limits & Inventory Clamping

Every physical resource is strictly clamped to prevent impossible negative values:
* $\text{Oxygen Inventory } \in [0.0, 1000.0]\text{ kg}$
* $\text{Water Inventory } \in [0.0, 5000.0]\text{ L}$
* $\text{Food Inventory } \in [0.0, 500000.0]\text{ kcal}$
* $\text{Battery Storage } \in [0.0, 200.0]\text{ kWh}$
* $\text{Equipment Condition } \in [0.0, 100.0]\%$
* $\text{Crew Cognitive Indices } \in [0.0, 100.0]$
* $\text{Blood Oxygen SpO₂ } \in [50.0, 100.0]\%$
