# System analysis Workshops
<small>Juan David Buitrago Rodriguez - 20242020194</small>
<br>
<small>David Giovanni Aza Carvajal - 20241020137</small>

- [Workshop I](#workshop-i)
- [Workshop II](#workshop-ii)
- [Workshop III](#workshop-iii)

---

# Workshop III

📄 **[Read Full Report](./Workshop_3_Simulation/Workshop_III_Report.pdf)**

This project simulates the development and dynamics of kidney blood vessels using a **Cellular Automaton** written in **Python** with **Tkinter** and **Pillow**. It models arteries, vessels, aneurysms, glomeruli, dead cells, and their behaviors in a histological grid.

---

## 🎯 Purpose

- To simulate kidney vascular tissue behavior and response to pathophysiological conditions like aneurysms or isolation.
- To process histological grayscale images and classify them into meaningful biological structures.
- To study vascular propagation and vessel repair patterns interactively.

---

## 🧪 Simulation Rules

| Cell Type        | Code | Color                        | Behavior                                                                                                                                   |
|------------------|------|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| **Artery**       | `A`  | Red                          | Constantly generates vessels in **cardinal directions** (↑ ↓ ← →). Always maintains adjacent vessels.                                      |
| **Vessel**       | `V`  | Blue (intensity based on neighbors) | Propagates to empty adjacent cells with probability `PROPAGATION_CHANCE`.<br>Dies if **isolated**.<br>Becomes **aneurysm** if ≥ `ANEURYSM_THRESHOLD` vessel/artery neighbors. |
| **Aneurysm**     | `X`  | Orange                       | Explodes if ≥ `ANEURYSM_EXPLODE_NEIGHBORS` aneurysm neighbors (cardinal).<br>Destroys nearby vessels within `EXPLOSION_RADIUS`.<br>Cures if surrounded by < `ANEURYSM_CURE_NEIGHBORS` vessels. |
| **Dead Cell**    | `D`  | Black                        | Revives into vessel if ≥ `REVIVE_DEAD_NEIGHBORS` vessel/artery neighbors.                                                                 |
| **Empty**        | `T`  | White                        | Can be converted into vessels by arteries or through propagation.                                                                         |
| **Glomerulus**   | `G`  | Green                        | Static biological filters. Marked as `G` when well vascularized.<br>Becomes `GF` (failing) if poorly irrigated (low vessel/artery support). |
| **Glomerulus (Failing)** | `GF` | Olive                     | Degrades from `G` if lacking support from nearby vessels or arteries.                                                                    |

---

## 🧠 Color Behavior

- **Vessels** (`V`) get **darker blue** when surrounded by more vessels or arteries (8 directions), and become lighter as they're isolated.
- **Aneurysms** are marked with a **bright orange**.
- **Glomeruli** are **green** when functional, and **olive** (`GF`) when not sufficiently irrigated.

---

## 🖼️ Image Integration

- You can **load grayscale kidney histology images** and convert them into grid states.
- Image pixels are classified by intensity:
  
  | Intensity Range | Cell Type |
  |------------------|------------|
  | < 90             | `A` Artery |
  | 90–129           | `V` Vessel |
  | 130–139          | `G` Glomerulus |
  | ≥ 140            | `T` Empty |

- Processed images are resized to `GRID_SIZE x GRID_SIZE` and visualized on the canvas.

---

## 🛠️ Global Parameters

You can adjust these in the Python code to change simulation sensitivity:

```python
PROPAGATION_CHANCE = 0.3          # Vessel spread probability
ANEURYSM_THRESHOLD = 5            # Neighbors to trigger aneurysm
ANEURYSM_EXPLODE_NEIGHBORS = 2    # Aneurysm neighbors needed to explode
ANEURYSM_CURE_NEIGHBORS = 4       # Vessels needed to heal an aneurysm
REVIVE_DEAD_NEIGHBORS = 1         # Neighbors needed to revive a dead cell
EXPLOSION_RADIUS = 2              # Radius affected by aneurysm explosion
```

---

## 🖱️ How to Use

1. When you launch the simulation, an empty grid will appear.
2. Use the buttons to select a cell type:
   - Artery (A)
   - Vessel (V)
   - Aneurysm (X)
   - Dead (D)
   - Empty (T)
   - Hypoxia (H)
3. Alternatively, you can upload a histological image of a kidney for better analysis, located in [images_to_use](./Workshop_3_Simulation/data/images_to_use/)
4. Click on the grid to place cells.
5. Click **Start Simulation** to begin.
6. Use **Step** to advance the simulation manually.
7. Click **Save CSV Result** to save your simulation data in a .csv file.  
8. Click **Reset** to clear the board and start over.

---

## 📦 Requirements

- contourpy       1.3.2
- cycler          0.12.1
- matplotlib      3.10.3
- numpy           2.3.1
- pillow          11.2.1
- pip             23.2.1
- pyparsing       3.2.3
- Tkinter  (pre-installed with Python)



📄 **[Read Full Workshop III Report](./Workshop_3_Simulation/Workshop_III_Report.pdf)**


---


# Workshop II 

📄 **[Read Full Report](./Workshop_2_Design/Workshop_II.pdf)**

Following the initial analysis phase, this workshop focuses on the implementation, evaluation, and iterative refinement of a deep learning model for histological image segmentation.

### 🧠 System Analysis Techniques

In this project, we used **system analysis** to better understand the problem and design the solution step by step. These are some of the techniques we applied:


- **Component Mapping:** We broke the project down into parts like: input data, preprocessing, model, output masks, and evaluation metrics.
- **Pipeline Visualization:** We created flowcharts and diagrams to see how the data moves through the model (from raw image to prediction).
- **Reference Analysis:** We studied successful public Kaggle notebooks and a key scientific paper that helped us understand how CNNs work in histological image segmentation.

---

### 🧬 CNN Implementation/Analysis Process

To build our Convolutional Neural Network (CNN) for classifying histological kidney images, we followed a structured process:

1. **Studied the Domain:** We analyzed histology slide structure and annotation formats, focusing on `.tif` images containing kidney tissue regions.

2. **Reviewed Scientific Literature:** We consulted key sources such as [Deep Learning for Semantic Segmentation in Histology](https://www.mdpi.com/2078-2489/16/3/195), which helped us understand histological image processing and neural network architectures relevant to biomedical tasks. Although the paper focuses on segmentation, we adapted its insights for a classification task.

3. **Implemented the Model:** We built a custom classifier using **ResNet50** enhanced with **CBAM (Convolutional Block Attention Module)**. Starting from ImageNet-pretrained weights, the model was fine-tuned to identify three classes in kidney histology tiles: *Glomerulus*, *Blood Vessel*, and *Unsure*. The addition of CBAM helps the network focus more effectively on meaningful spatial and channel-wise features, improving its ability to capture subtle patterns in the tissue.


4. **Prepared the Data:** Whole-slide `.tif` images were divided into 512×512 tiles. Each tile was preprocessed using resizing and normalization, then passed through the model for classification.

The model workflow is as follows:

- A `.tif` image is split into fixed-size tiles.
- Each tile is preprocessed and passed into the ResNet50_CBAM model.
- The model predicts class probabilities using a softmax layer.
- Predictions per tile are printed and optionally stored in a table for analysis.

This pipeline provides a fast and scalable method for classifying high-resolution histology data using deep learning and attention-enhanced CNNs.

5. **Applied the Concepts:** In the **[/code](./Workshop_2_Design/code)** folder, we tried to apply what we learned by creating a custom CNN Implementation. This involved testing out different architectural changes and making adjustments to improve the system.


📘 **[Return to Report](./Workshop_2_Design/Workshop_II_Report.pdf)**


---



# Workshop I 


## 🔍 Analysis 

📄 **[Read Full Report](./Workshop-I/Workshop_I_Report.pdf)**

The analysis conducted for this report was structured into four key phases, each with a specific goal:

---

###  Phases 

- **1. Data & Overview Analysis**
  - 📚 **Objective:** Understand the dataset and initial data structure.
  -  **Actions:**
    - Explored the `.tif` image files and metadata.
    - Reviewed competition goals and objectives.
    - The dataset for this competition is located in `/Workshop-I/data/`, exepting the folder `/test` and `/train` folders  that contain the `.tif` images  due to their size (>4GB). These files can be downloaded directly from [Kaggle’s competition page](https://www.kaggle.com/competitions/hubmap-hacking-the-human-vasculature/data).

- **2. Thematic Research**
  - 📚 **Objective:** Investigate domain-specific knowledge.
  -  **Topics Covered:**
    - Histological tissues and blood vessel anatomy.
    - WSI (Whole Slide Imaging) concepts.
    - Role of masks and annotations in biomedical imaging.
    - How Kaggle competitions are typically structured.

- **3. Competition Notebooks Lookup**
  - 📚 **Objective:** Gain insights from public solutions.
  -  **Activities:**
    - Reviewed notebooks on Kaggle.
    - Analyzed preprocessing and visualization techniques.
    - Observed modeling strategies for mask handling.
    - A thorough review of public notebooks related to the competition was conducted, we made particular focus on the [notebook by Ahmed Maher El-Saeidy](https://www.kaggle.com/code/ahmedmaherelsaeidy/hubmap-hacking-the-human-vasculature-dataset). The code from this notebook was used as a reference and implemented under the purpose of understanding the dataflow and how the elements interacted among themselves. This implementation can be found in the folder `/Workshop-I/code`.

- **4. System Comprehension & Analysis**  
   After gathering all the information from the previous phases, we structured the system analysis by mapping out how components interact within the pipeline, summarizing key insights, and formulating visual overviews. All these findings were integrated into our final **[report](./Workshop-I/Workshop_I_Report.pdf)**.

---

📘 **[Return to Report](./Workshop-I/Workshop_I_Report.pdf)**


