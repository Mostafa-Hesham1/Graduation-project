"""
This script checks if MMDetection is properly installed and can be imported.
Run this separately to debug installation issues.
"""

import sys
import os
import traceback

print("Python version:", sys.version)
print("Current working directory:", os.getcwd())

# Add the mmdetection path
mmdet_path = r"C:\Users\mosta\OneDrive\Desktop\VehicleSouq (2)\VehicleSouq\backend\mmdetection"
if mmdet_path not in sys.path:
    sys.path.append(mmdet_path)
    print(f"Added {mmdet_path} to Python path")

print("\nChecking for MMDetection dependencies...")

# Check basic dependencies first
try:
    import torch
    print(f"PyTorch: {torch.__version__}, CUDA available: {torch.cuda.is_available()}")
except ImportError as e:
    print(f"PyTorch not installed or has issues: {e}")

try:
    import numpy
    print(f"NumPy: {numpy.__version__}")
except ImportError as e:
    print(f"NumPy not installed or has issues: {e}")

try:
    import cv2
    print(f"OpenCV: {cv2.__version__}")
except ImportError as e:
    print(f"OpenCV not installed or has issues: {e}")

print("\nChecking MMDetection components...")

# Try importing the key MMDetection components
try:
    from mmengine import Config
    print("✓ mmengine.Config imported successfully")
except ImportError as e:
    print(f"✗ Failed to import mmengine.Config: {e}")
    print("  Try installing with: pip install mmengine")

try:
    import mmcv
    print(f"✓ mmcv imported successfully: {mmcv.__version__}")
except ImportError as e:
    print(f"✗ Failed to import mmcv: {e}")
    print("  Try installing with: pip install mmcv==2.1.0")

print("\nTrying to import MMDetection components...")

try:
    import mmdet
    print(f"✓ mmdet imported successfully: {mmdet.__version__}")
except ImportError as e:
    print(f"✗ Failed to import mmdet: {e}")
    print("  Make sure you've installed MMDetection with: pip install -e C:/Users/mosta/OneDrive/Desktop/VehicleSouq (2)/VehicleSouq/backend/mmdetection")

try:
    from mmdet.apis import inference_detector, init_detector
    print("✓ mmdet.apis functions imported successfully")
except ImportError as e:
    print(f"✗ Failed to import mmdet.apis functions: {e}")
    print(traceback.format_exc())

print("\nChecking if model files exist...")

# Check if DCN files exist
dcn_config_path = r"C:\Users\mosta\OneDrive\Desktop\VehicleSouq (2)\VehicleSouq\backend\ML-Models\CarDamageModels\dcn_plus_cfg.py"
dcn_checkpoint_path = r"C:\Users\mosta\OneDrive\Desktop\VehicleSouq (2)\VehicleSouq\backend\ML-Models\CarDamageModels\epoch_25.pth"

if os.path.exists(dcn_config_path):
    print(f"✓ DCN+ config file exists at: {dcn_config_path}")
else:
    print(f"✗ DCN+ config file MISSING at: {dcn_config_path}")
    
if os.path.exists(dcn_checkpoint_path):
    print(f"✓ DCN+ checkpoint file exists at: {dcn_checkpoint_path}")
else:
    print(f"✗ DCN+ checkpoint file MISSING at: {dcn_checkpoint_path}")

print("\nTrying to load DCN+ model config...")
try:
    from mmengine import Config
    cfg = Config.fromfile(dcn_config_path)
    print("✓ Successfully loaded DCN+ config")
    print(f"  Config contains {len(cfg.keys())} keys")
except Exception as e:
    print(f"✗ Failed to load DCN+ config: {e}")
    print(traceback.format_exc())

if 'torch' in sys.modules and os.path.exists(dcn_config_path) and os.path.exists(dcn_checkpoint_path):
    print("\nTrying to initialize model...")
    try:
        device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
        print(f"Using device: {device}")
        
        from mmdet.apis import init_detector
        model = init_detector(dcn_config_path, dcn_checkpoint_path, device=device)
        print("✓ Successfully initialized DCN+ model!")
    except Exception as e:
        print(f"✗ Failed to initialize DCN+ model: {e}")
        print(traceback.format_exc())
