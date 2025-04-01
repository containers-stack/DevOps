import streamlit as st
from datetime import datetime, timedelta, tzinfo
import requests
from dotenv import load_dotenv
import os
import pandas as pd
import numpy as np
import pytz
import plotly.graph_objects as go

# Load environment variables from .env file
load_dotenv()

TENANT_ID = os.getenv("TENANT_ID")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
USERS_ID = os.getenv("USERS_ID")

# Check if all required environment variables are set
if not all([TENANT_ID, CLIENT_ID, CLIENT_SECRET]):
    st.error("Please set the TENANT_ID, CLIENT_ID, and CLIENT_SECRET environment variables.")
    st.stop()

# Function to get Graph API token
def get_graph_api_token():
    url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "client_id": CLIENT_ID,
        "scope": "https://graph.microsoft.com/.default",
        "client_secret": CLIENT_SECRET,
        "grant_type": "client_credentials"
    }
    response = requests.post(url, headers=headers, data=data)
    if response.status_code == 200:
        return response.json().get("access_token")
    else:
        st.error("Failed to authenticate with Graph API.")
        return None

# Fetch the token
graph_api_token = get_graph_api_token()
if graph_api_token:
    st.toast("Successfully authenticated with Graph API.")

# Set the title of the app
st.title("Team Calendar")

# Allow user to select custom date range
st.sidebar.header("Select Date Range")
start_date_input = st.sidebar.date_input("Start Date", datetime.now().date())
end_date_input = st.sidebar.date_input("End Date", datetime.now().date() + timedelta(days=7))

# Ensure end date is after start date
if start_date_input > end_date_input:
    st.error("End date must be after start date.")
    st.stop()

# Define working hours
WORK_START_HOUR = 8
WORK_END_HOUR = 18

# Adjust start and end datetime to working hours
start_datetime = datetime.combine(start_date_input, datetime.min.time()).replace(hour=WORK_START_HOUR)
end_datetime = datetime.combine(end_date_input, datetime.min.time()).replace(hour=WORK_END_HOUR)

# Update ISO format strings for Graph API
start_date = start_datetime.isoformat()
end_date = end_datetime.isoformat()

# for each user, get the calendar events
def get_calendar_events(user_id, start_date, end_date):
    url = f"https://graph.microsoft.com/v1.0/users/{user_id}/calendarView?startDateTime={start_date}&endDateTime={end_date}"
    headers = {
        "Authorization": f"Bearer {graph_api_token}",
        "Content-Type": "application/json"
    }
    events = []
    while url:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            events.extend(data.get("value", []))
            url = data.get("@odata.nextLink")  # Get the next page link if available
        else:
            st.error(f"Failed to fetch calendar events for user {user_id}.")
            break
    return events

# Get the current date and time
now = datetime.now()

# Get the start and end date for the calendar view
start_date = now.strftime("%Y-%m-%dT%H:%M:%S")
end_date = (now + timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%S")

# USERS_ID should be a comma-separated list of user IDs in the .env file
user_ids = USERS_ID.split(',')

LOCAL_TIMEZONE = pytz.timezone('Asia/Jerusalem')

# Updated availability calculation considering working hours only
def calculate_availability(events, start_datetime, end_datetime):
    total_minutes = 0
    busy_minutes = 0
    current_day = start_datetime.date()
    while current_day <= end_datetime.date():
        work_start = LOCAL_TIMEZONE.localize(datetime.combine(current_day, datetime.min.time()).replace(hour=WORK_START_HOUR))
        work_end = LOCAL_TIMEZONE.localize(datetime.combine(current_day, datetime.min.time()).replace(hour=WORK_END_HOUR))
        total_minutes += (work_end - work_start).total_seconds() / 60

        daily_intervals = []
        for event in events:
            event_start_utc = datetime.fromisoformat(event['start']['dateTime'].split('.')[0]).replace(tzinfo=pytz.utc)
            event_end_utc = datetime.fromisoformat(event['end']['dateTime'].split('.')[0]).replace(tzinfo=pytz.utc)

            event_start_local = event_start_utc.astimezone(LOCAL_TIMEZONE)
            event_end_local = event_end_utc.astimezone(LOCAL_TIMEZONE)

            event_start_clipped = max(event_start_local, work_start)
            event_end_clipped = min(event_end_local, work_end)

            if event_start_clipped < event_end_clipped:
                daily_intervals.append((event_start_clipped, event_end_clipped))

        # Merge overlapping intervals per day
        daily_intervals.sort()
        merged_intervals = []
        for interval in daily_intervals:
            if not merged_intervals or interval[0] > merged_intervals[-1][1]:
                merged_intervals.append(interval)
            else:
                merged_intervals[-1] = (merged_intervals[-1][0], max(merged_intervals[-1][1], interval[1]))

        busy_minutes += sum((end - start).total_seconds() / 60 for start, end in merged_intervals)
        current_day += timedelta(days=1)

    availability = max(0, 100 - (busy_minutes / total_minutes * 100))
    return availability

# Fetch and calculate availability for each user
user_availability = {}
user_events_dict = {}

for user_id in user_ids:
    events = get_calendar_events(user_id.strip(), start_datetime.isoformat(), end_datetime.isoformat())
    availability = calculate_availability(events, start_datetime, end_datetime)
    user_availability[user_id.strip()] = availability
    user_events_dict[user_id.strip()] = events  # store events for each user

# Calculate team availability and pressure
availability_values = list(user_availability.values())
team_availability = np.mean(availability_values)
team_pressure = 100 - team_availability

# Display individual availability
st.subheader("Individual Availability (%)")
availability_df = pd.DataFrame({
    'User': user_availability.keys(),
    'Availability': availability_values
})
st.bar_chart(availability_df.set_index('User'))

# Display team availability and pressure
st.subheader("Team Overview")
col1, col2 = st.columns(2)
col1.metric("Team Availability (%)", f"{team_availability:.2f}%")
col2.metric("Team Pressure (%)", f"{team_pressure:.2f}%")

# Display team availability and pressure with a Gauge Panel
st.subheader("Team Availability Gauge")
fig = go.Figure(go.Indicator(
    mode="gauge+number",
    value=team_availability,
    title={'text': "Team Availability (%)"},
    gauge={
        'axis': {'range': [0, 100]},
        'bar': {'color': "rgba(0,0,0,0)"},  # Make the bar transparent
        'steps': [
            {'range': [0, 100 - team_availability], 'color': "red"},
            {'range': [100 - team_availability, 100], 'color': "lightgreen"}
        ]
    }
))
st.plotly_chart(fig)

# Additional chart: Line chart for individual availability over time
st.subheader("Individual Availability Over Time")
availability_over_time = pd.DataFrame({
    'User': user_availability.keys(),
    'Availability': availability_values
})
st.line_chart(availability_over_time.set_index('User'))

# Additional chart: Pie chart for team availability distribution
st.subheader("Team Availability Distribution")
availability_distribution = pd.DataFrame({
    'User': user_availability.keys(),
    'Availability': availability_values
})
fig_pie = go.Figure(data=[go.Pie(labels=availability_distribution['User'], values=availability_distribution['Availability'])])
st.plotly_chart(fig_pie)

# Display individual events list without duplicates
st.subheader("Individual Events")
for user_id, events in user_events_dict.items():
    with st.expander(f"Events for {user_id}"):
        if events:
            seen_subjects = set()
            unique_events = []
            for event in events:
                subject = event['subject']
                if subject not in seen_subjects and "חופש" not in subject:
                    seen_subjects.add(subject)
                    unique_events.append({
                        'Subject': subject,
                        'Start': datetime.fromisoformat(event['start']['dateTime'].split('.')[0]).replace(tzinfo=pytz.utc).astimezone(LOCAL_TIMEZONE).strftime('%Y-%m-%d %H:%M'),
                        'End': datetime.fromisoformat(event['end']['dateTime'].split('.')[0]).replace(tzinfo=pytz.utc).astimezone(LOCAL_TIMEZONE).strftime('%Y-%m-%d %H:%M'),
                        'Duration (hours)': round((datetime.fromisoformat(event['end']['dateTime'].split('.')[0]) - datetime.fromisoformat(event['start']['dateTime'].split('.')[0])).total_seconds() / 3600, 2)
                    })

            events_df = pd.DataFrame(unique_events)
            events_df['Start'] = pd.to_datetime(events_df['Start'])
            events_df = events_df.sort_values(by='Start')
            events_df['Start'] = events_df['Start'].dt.strftime('%Y-%m-%d %H:%M')
            st.table(events_df)
            total_hours = events_df['Duration (hours)'].sum()
            st.write(f"**Total Hours:** {total_hours:.2f} hours")
        else:
            st.write("No events found for this period.")



