import pandas as pd

data = pd.read_csv("data/taylor_swift_spotify.csv")

unwanted_albums = [
    "THE TORTURED POETS DEPARTMENT: THE ANTHOLOGY",
    "1989 (Taylor's Version) [Deluxe]",
    "Midnights (The Til Dawn Edition)",
    "Midnights (3am Edition)",
    "evermore (deluxe version)",
    "folklore: the long pond studio sessions (from the Disney+ special) [deluxe edition]",
    "folklore (deluxe version)",
    "reputation Stadium Tour Surprise Song Playlist",
    "1989 (Deluxe)",
    "Red (Deluxe Edition)",
    "Speak Now World Tour Live",
    "Speak Now (Deluxe Package)",
    "Fearless (Platinum Edition)",
    "Live From Clear Channel Stripped 2008",
]
# Filter out unwanted albums
filtered_df = data[~data['album'].isin(unwanted_albums)]

album_name_map = {
    "Fearless (International Version)": "Fearless",
    "Taylor Swift (Deluxe Edition)": "Taylor Swift",
    "THE TORTURED POETS DEPARTMENT": "The Tortured Poets Department",
}

filtered_df.loc[:, 'album'] = filtered_df['album'].replace(album_name_map)


# Optionally save the filtered data
filtered_df.to_csv('swift_data.csv', index=False)