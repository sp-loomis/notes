import streamlit as st
import geopandas as gpd
import pandas as pd
import numpy as np
import folium
from folium import plugins
from folium.plugins import Draw
from streamlit_folium import folium_static
import json
import base64
import io
import pyproj
from shapely.geometry import Point, LineString, Polygon
import tempfile
import os

st.set_page_config(layout="wide", page_title="Shapefile Editor")

# Set up the app layout
st.title("Interactive Shapefile Editor")
st.write("Upload, view, edit, and export shapefiles with different projections.")

# Initialize session state variables if they don't exist
if 'gdf' not in st.session_state:
    st.session_state['gdf'] = None
if 'drawn_features' not in st.session_state:
    st.session_state['drawn_features'] = None
if 'current_projection' not in st.session_state:
    st.session_state['current_projection'] = 'EPSG:4326'  # WGS84
if 'base_map' not in st.session_state:
    st.session_state['base_map'] = 'OpenStreetMap'

# Create columns for sidebar and main content
col1, col2 = st.columns([1, 2])

with col1:
    st.header("Controls")
    
    # File upload section
    st.subheader("Upload Data")
    uploaded_file = st.file_uploader("Upload Shapefile (as ZIP) or GeoJSON", type=['zip', 'geojson'])
    
    if uploaded_file is not None:
        # Handle the uploaded file
        if uploaded_file.name.endswith('.zip'):
            # For shapefile (zipped)
            with tempfile.TemporaryDirectory() as tmpdir:
                # Extract the zip contents to temp directory
                import zipfile
                with zipfile.ZipFile(uploaded_file) as z:
                    z.extractall(tmpdir)
                
                # Find the .shp file in the directory
                shp_files = [f for f in os.listdir(tmpdir) if f.endswith('.shp')]
                if shp_files:
                    shapefile_path = os.path.join(tmpdir, shp_files[0])
                    st.session_state['gdf'] = gpd.read_file(shapefile_path)
                    st.success(f"Loaded shapefile: {shp_files[0]}")
                else:
                    st.error("No .shp file found in the uploaded zip.")
        
        elif uploaded_file.name.endswith('.geojson'):
            # For GeoJSON
            geojson_data = json.load(uploaded_file)
            st.session_state['gdf'] = gpd.GeoDataFrame.from_features(
                geojson_data["features"] if "features" in geojson_data else [geojson_data],
                crs="EPSG:4326"
            )
            st.success("Loaded GeoJSON file")
    
    # Projection settings
    st.subheader("Projection Settings")
    projection_options = {
        'WGS84 (EPSG:4326)': 'EPSG:4326',
        'Web Mercator (EPSG:3857)': 'EPSG:3857',
        'UTM Zone 11N (EPSG:32611)': 'EPSG:32611',
        'Robinson (ESRI:54030)': 'ESRI:54030'
    }
    selected_proj = st.selectbox(
        "Select Projection",
        options=list(projection_options.keys()),
        index=0
    )
    st.session_state['current_projection'] = projection_options[selected_proj]
    
    # Base map selection
    st.subheader("Base Map")
    base_map_options = [
        'OpenStreetMap', 'Stamen Terrain', 'Stamen Toner', 
        'Cartodb Positron', 'Cartodb Dark_Matter'
    ]
    st.session_state['base_map'] = st.selectbox(
        "Select Base Map",
        options=base_map_options,
        index=base_map_options.index(st.session_state['base_map'])
    )
    
    # Export options
    st.subheader("Export Data")
    export_format = st.selectbox(
        "Export Format",
        options=['GeoJSON', 'Shapefile']
    )
    
    if st.button("Export Data") and st.session_state['gdf'] is not None:
        # Ensure the data is in the selected projection
        gdf_export = st.session_state['gdf'].to_crs(st.session_state['current_projection'])
        
        if export_format == 'GeoJSON':
            # Export as GeoJSON
            geo_json = gdf_export.to_json()
            b64 = base64.b64encode(geo_json.encode()).decode()
            href = f'<a href="data:application/json;base64,{b64}" download="exported_data.geojson">Download GeoJSON</a>'
            st.markdown(href, unsafe_allow_html=True)
        
        else:  # Shapefile
            # Export as Shapefile (requires creating a zip)
            with tempfile.TemporaryDirectory() as tmpdir:
                # Save shapefile to temporary directory
                shp_path = os.path.join(tmpdir, "export_shapefile.shp")
                gdf_export.to_file(shp_path)
                
                # Create a zip file containing all the shapefile components
                zip_path = os.path.join(tmpdir, "exported_shapefile.zip")
                with zipfile.ZipFile(zip_path, 'w') as zipf:
                    for ext in ['.shp', '.shx', '.dbf', '.prj', '.cpg']:
                        file_path = shp_path.replace('.shp', ext)
                        if os.path.exists(file_path):
                            zipf.write(file_path, os.path.basename(file_path))
                
                # Create download link
                with open(zip_path, "rb") as f:
                    bytes_data = f.read()
                    b64 = base64.b64encode(bytes_data).decode()
                    href = f'<a href="data:application/zip;base64,{b64}" download="exported_shapefile.zip">Download Shapefile</a>'
                    st.markdown(href, unsafe_allow_html=True)

with col2:
    st.header("Map View")
    
    # Create base map
    m = folium.Map(
        location=[0, 0],
        zoom_start=2,
        tiles=st.session_state['base_map']
    )
    
    # Add the drawing tool
    draw = Draw(
        draw_options={
            'polyline': True,
            'polygon': True,
            'rectangle': True,
            'circle': True,
            'marker': True,
            'circlemarker': False
        },
        edit_options={
            'featureGroup': None
        }
    )
    draw.add_to(m)
    
    # Add data from GeoDataFrame if available
    if st.session_state['gdf'] is not None:
        # Transform to WGS84 for display on web map
        gdf_display = st.session_state['gdf'].to_crs('EPSG:4326')
        
        # Add the layer to the map
        folium.GeoJson(
            data=gdf_display,
            style_function=lambda x: {
                'fillColor': 'blue',
                'color': 'blue',
                'weight': 2,
                'fillOpacity': 0.4
            },
            tooltip=folium.GeoJsonTooltip(
                fields=gdf_display.columns[:3].tolist(),
                aliases=gdf_display.columns[:3].tolist(),
                style=("background-color: white; color: #333333; font-family: arial; font-size: 12px; padding: 10px;")
            )
        ).add_to(m)
        
        # Zoom to the data extent
        bounds = gdf_display.total_bounds
        m.fit_bounds([[bounds[1], bounds[0]], [bounds[3], bounds[2]]])
    
    # Display the map
    map_data = folium_static(m, width=800, height=600)
    
    # JavaScript callback to capture drawn features
    st.markdown("""
    <script>
    // This would capture drawn features in a real implementation
    // For now, we'll use a manual feature creation in the demo
    </script>
    """, unsafe_allow_html=True)
    
    # For demo purposes, simulate the drawn features
    st.subheader("Create New Feature")
    feature_type = st.selectbox(
        "Feature Type",
        options=['Point', 'Line', 'Polygon']
    )
    
    if feature_type == 'Point':
        col_lat, col_lon = st.columns(2)
        with col_lat:
            lat = st.number_input("Latitude", value=0.0, min_value=-90.0, max_value=90.0)
        with col_lon:
            lon = st.number_input("Longitude", value=0.0, min_value=-180.0, max_value=180.0)
        
        if st.button("Add Point"):
            # Create a new point
            new_point = gpd.GeoDataFrame(
                {'geometry': [Point(lon, lat)]},
                crs='EPSG:4326'
            )
            
            # Initialize or append to existing GeoDataFrame
            if st.session_state['gdf'] is None:
                st.session_state['gdf'] = new_point
            else:
                st.session_state['gdf'] = pd.concat([st.session_state['gdf'], new_point.to_crs(st.session_state['gdf'].crs)])
            
            st.success("Point added! Refresh the map to see it.")
            st.experimental_rerun()
    
    elif feature_type == 'Line':
        st.write("Enter coordinates for line vertices (lat, lon pairs)")
        
        coords = []
        num_points = st.number_input("Number of vertices", min_value=2, max_value=10, value=2)
        
        for i in range(num_points):
            col_lat, col_lon = st.columns(2)
            with col_lat:
                lat = st.number_input(f"Latitude {i+1}", value=0.0, min_value=-90.0, max_value=90.0, key=f"lat_{i}")
            with col_lon:
                lon = st.number_input(f"Longitude {i+1}", value=0.0, min_value=-180.0, max_value=180.0, key=f"lon_{i}")
            coords.append((lon, lat))
        
        if st.button("Add Line"):
            # Create a new line
            new_line = gpd.GeoDataFrame(
                {'geometry': [LineString(coords)]},
                crs='EPSG:4326'
            )
            
            # Initialize or append to existing GeoDataFrame
            if st.session_state['gdf'] is None:
                st.session_state['gdf'] = new_line
            else:
                st.session_state['gdf'] = pd.concat([st.session_state['gdf'], new_line.to_crs(st.session_state['gdf'].crs)])
            
            st.success("Line added! Refresh the map to see it.")
            st.experimental_rerun()
    
    elif feature_type == 'Polygon':
        st.write("Enter coordinates for polygon vertices (lat, lon pairs)")
        
        coords = []
        num_points = st.number_input("Number of vertices", min_value=3, max_value=10, value=3)
        
        for i in range(num_points):
            col_lat, col_lon = st.columns(2)
            with col_lat:
                lat = st.number_input(f"Latitude {i+1}", value=0.0, min_value=-90.0, max_value=90.0, key=f"lat_{i}")
            with col_lon:
                lon = st.number_input(f"Longitude {i+1}", value=0.0, min_value=-180.0, max_value=180.0, key=f"lon_{i}")
            coords.append((lon, lat))
        
        # Close the polygon
        if coords and coords[0] != coords[-1]:
            coords.append(coords[0])
        
        if st.button("Add Polygon"):
            # Create a new polygon
            new_polygon = gpd.GeoDataFrame(
                {'geometry': [Polygon(coords)]},
                crs='EPSG:4326'
            )
            
            # Initialize or append to existing GeoDataFrame
            if st.session_state['gdf'] is None:
                st.session_state['gdf'] = new_polygon
            else:
                st.session_state['gdf'] = pd.concat([st.session_state['gdf'], new_polygon.to_crs(st.session_state['gdf'].crs)])
            
            st.success("Polygon added! Refresh the map to see it.")
            st.experimental_rerun()

    # Show data table
    if st.session_state['gdf'] is not None:
        st.subheader("Feature Data")
        # Display a simplified view of the data
        display_gdf = st.session_state['gdf'].copy()
        # Replace geometry with a string representation
        display_gdf['geometry_type'] = display_gdf['geometry'].apply(lambda x: x.geom_type)
        display_gdf = display_gdf.drop(columns=['geometry'])
        st.dataframe(display_gdf)

# Add custom styles
st.markdown("""
<style>
    .stButton>button {
        background-color: #4CAF50;
        color: white;
        width: 100%;
    }
    .stSelectbox>div>div {
        background-color: #f0f2f6;
    }
    .css-1d391kg {
        padding: 1rem;
    }
</style>
""", unsafe_allow_html=True)