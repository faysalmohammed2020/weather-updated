import xarray as xr
import matplotlib.pyplot as plt
import os
import sys

# Input file
filename = sys.argv[1]
input_path = os.path.join("public/uploads", filename)
output_dir = os.path.join("public/outputs")
os.makedirs(output_dir, exist_ok=True)

# ভ্যারিয়েবল অনুযায়ী কালারম্যাপ নির্ধারণ
colormaps = {
    "t2": "plasma",         # temperature
    "rainc": "Blues",       # rainfall cumulus
    "rainnc": "YlGnBu",     # rainfall non-cumulus
    "rh2": "YlGnBu",        # humidity
    "u10m": "RdBu",     # East-West wind component
    "v10m": "PiYG",     # North-South wind component
}

ds = xr.open_dataset(input_path)
plot_paths = {}

for var in ds.data_vars:
    try:
        data = ds[var].isel(time=0) if "time" in ds[var].dims else ds[var]

        cmap = colormaps.get(var, "viridis")  # fallback cmap
        plt.figure(figsize=(8, 6))
        data.plot(cmap=cmap)
        plt.title(f"{var.upper()} Visualization")
        output_path = os.path.join(output_dir, f"{filename}_{var}.png")
        plt.savefig(output_path)
        plt.close()

        plot_paths[var] = f"/outputs/{filename}_{var}.png"
    except Exception as e:
        print(f"Skipping {var}: {e}")

# Return as JSON string
print(plot_paths)
