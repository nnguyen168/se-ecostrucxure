"""Turbine router for wind turbine fleet management."""

from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from enum import Enum
import random

router = APIRouter()


class TurbineStatus(str, Enum):
  """Turbine operational status."""
  OPERATIONAL = 'operational'
  WARNING = 'warning'
  MAINTENANCE = 'maintenance'
  OFFLINE = 'offline'


class TurbineLocation(BaseModel):
  """Turbine geographic location."""
  latitude: float
  longitude: float


class Turbine(BaseModel):
  """Individual turbine information."""
  id: int
  name: str
  status: TurbineStatus
  location: TurbineLocation
  energy_output: float  # Current output in MW
  capacity: float  # Maximum capacity in MW
  health_score: float  # 0-100 percentage
  last_maintenance: datetime
  next_maintenance: datetime
  operational_hours: int
  error_codes: List[str] = []


class FleetKPIs(BaseModel):
  """Fleet-wide key performance indicators."""
  total_turbines: int
  turbines_needing_maintenance: int
  fleet_health_percentage: float
  total_energy_production: float  # GWh
  operational_turbines: int
  warning_turbines: int
  offline_turbines: int


class EnergyOutput(BaseModel):
  """Energy output data point."""
  timestamp: datetime
  value: float  # MWh


class AssistantSummary(BaseModel):
  """Virtual assistant daily summary."""
  message: str
  priority_items: List[str]
  weather_status: str
  performance_summary: str


def generate_mock_turbines(count: int = 156) -> List[Turbine]:
  """Generate mock turbine data for demonstration."""
  turbines = []
  for i in range(1, count + 1):
    status = random.choice(list(TurbineStatus))
    health = random.uniform(70, 100) if status == TurbineStatus.OPERATIONAL else random.uniform(40, 80)

    turbine = Turbine(
      id=i,
      name=f'WT-{i:03d}',
      status=status,
      location=TurbineLocation(
        latitude=45.5 + random.uniform(-0.5, 0.5),
        longitude=-73.6 + random.uniform(-0.5, 0.5)
      ),
      energy_output=random.uniform(0.5, 2.5) if status == TurbineStatus.OPERATIONAL else 0,
      capacity=3.0,
      health_score=health,
      last_maintenance=datetime.now() - timedelta(days=random.randint(1, 90)),
      next_maintenance=datetime.now() + timedelta(days=random.randint(1, 90)),
      operational_hours=random.randint(1000, 50000),
      error_codes=[] if status == TurbineStatus.OPERATIONAL else [f'ERR{random.randint(100, 999)}']
    )
    turbines.append(turbine)
  return turbines


@router.get('/kpis', response_model=FleetKPIs)
async def get_fleet_kpis():
  """Get fleet-wide KPIs."""
  turbines = generate_mock_turbines()

  operational = len([t for t in turbines if t.status == TurbineStatus.OPERATIONAL])
  warning = len([t for t in turbines if t.status == TurbineStatus.WARNING])
  maintenance = len([t for t in turbines if t.status == TurbineStatus.MAINTENANCE])
  offline = len([t for t in turbines if t.status == TurbineStatus.OFFLINE])

  return FleetKPIs(
    total_turbines=len(turbines),
    turbines_needing_maintenance=maintenance,
    fleet_health_percentage=round(sum(t.health_score for t in turbines) / len(turbines), 1),
    total_energy_production=round(sum(t.energy_output for t in turbines) * 24 / 1000, 1),  # Convert to GWh
    operational_turbines=operational,
    warning_turbines=warning,
    offline_turbines=offline
  )


@router.get('/turbines', response_model=List[Turbine])
async def get_turbines(
  status: Optional[TurbineStatus] = None,
  limit: int = 100,
  offset: int = 0
):
  """Get list of turbines with optional filtering."""
  turbines = generate_mock_turbines()

  if status:
    turbines = [t for t in turbines if t.status == status]

  return turbines[offset:offset + limit]


@router.get('/turbines/{turbine_id}', response_model=Turbine)
async def get_turbine(turbine_id: int):
  """Get specific turbine details."""
  turbines = generate_mock_turbines()

  turbine = next((t for t in turbines if t.id == turbine_id), None)
  if not turbine:
    raise HTTPException(status_code=404, detail=f'Turbine {turbine_id} not found')

  return turbine


@router.get('/energy-output', response_model=List[EnergyOutput])
async def get_energy_output(hours: int = 24):
  """Get energy output history."""
  output = []
  now = datetime.now()

  for i in range(hours):
    timestamp = now - timedelta(hours=hours - i - 1)
    # Simulate daily pattern with peak during day hours
    hour = timestamp.hour
    base_output = 10.0
    if 6 <= hour <= 18:
      multiplier = 1.5 + 0.5 * ((hour - 6) / 6 if hour <= 12 else (18 - hour) / 6)
    else:
      multiplier = 0.7

    value = base_output * multiplier * random.uniform(0.9, 1.1)

    output.append(EnergyOutput(
      timestamp=timestamp,
      value=round(value, 2)
    ))

  return output


@router.get('/assistant-summary', response_model=AssistantSummary)
async def get_assistant_summary():
  """Get virtual assistant daily summary."""
  return AssistantSummary(
    message='Good morning! Your fleet is performing well today with optimal weather conditions.',
    priority_items=[
      '3 turbines require immediate attention in Sector B',
      'Scheduled maintenance for WT-045 is due tomorrow',
      'Wind forecast shows increased output potential for next 48 hours',
      'WT-112 has been offline for 12 hours - investigation recommended'
    ],
    weather_status='Optimal - Wind speed 15-25 km/h, clear conditions',
    performance_summary='Energy production is exceeding targets by 8%. Current output: 15.7 GWh'
  )


@router.post('/turbines/{turbine_id}/maintenance')
async def schedule_maintenance(turbine_id: int, maintenance_date: datetime):
  """Schedule maintenance for a turbine."""
  return {
    'success': True,
    'turbine_id': turbine_id,
    'scheduled_date': maintenance_date,
    'message': f'Maintenance scheduled for turbine {turbine_id}'
  }


@router.get('/turbines/map/clusters')
async def get_turbine_clusters():
  """Get turbine location clusters for map display with realistic US wind farm locations."""

  # Major US wind farm locations
  wind_farms = [
    # Texas Panhandle - largest wind capacity in US
    {"name": "Texas Panhandle", "lat": 35.2, "lng": -101.8, "turbines": 25, "region": "Great Plains"},
    # Iowa - second largest wind capacity
    {"name": "Iowa Corn Belt", "lat": 42.0, "lng": -93.5, "turbines": 18, "region": "Midwest"},
    # California - Tehachapi Pass
    {"name": "Tehachapi Pass", "lat": 35.1, "lng": -118.3, "turbines": 15, "region": "California"},
    # Wyoming - Medicine Bow
    {"name": "Medicine Bow", "lat": 41.9, "lng": -106.3, "turbines": 12, "region": "Rocky Mountains"},
    # Oklahoma Wind Corridor
    {"name": "Oklahoma Wind Corridor", "lat": 35.5, "lng": -98.5, "turbines": 20, "region": "Great Plains"},
    # Illinois Prairie
    {"name": "Illinois Prairie", "lat": 40.8, "lng": -89.4, "turbines": 10, "region": "Midwest"},
  ]

  clusters = []
  turbine_id = 1

  for farm in wind_farms:
    for i in range(farm["turbines"]):
      # Add some variation to positions within each wind farm
      lat_offset = random.uniform(-0.3, 0.3)
      lng_offset = random.uniform(-0.3, 0.3)

      status = random.choices(
        [TurbineStatus.OPERATIONAL, TurbineStatus.WARNING, TurbineStatus.MAINTENANCE],
        weights=[0.75, 0.15, 0.10]
      )[0]

      clusters.append({
        'id': turbine_id,
        'name': f'{farm["name"][:2].upper()}-{turbine_id:03d}',
        'lat': farm["lat"] + lat_offset,
        'lng': farm["lng"] + lng_offset,
        'status': status.value,
        'energy_output': random.uniform(1.5, 3.5) if status == TurbineStatus.OPERATIONAL else 0,
        'wind_speed': random.uniform(8, 20),
        'farm_name': farm["name"],
        'region': farm["region"]
      })
      turbine_id += 1

  return clusters