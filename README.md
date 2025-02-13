[![Python 3.10](https://img.shields.io/badge/python-3.10-blue.svg)](https://www.python.org/downloads/release/python-310/)
[![MIT License](https://img.shields.io/github/license/m43/focal-loss-against-heuristics)](LICENSE)
[![arXiv](https://img.shields.io/badge/arXiv-2403.14380-b31b1b.svg)](https://arxiv.org/abs/2403.14380)

# DebateGPT - On the Conversational Persuasiveness of Large Language Models

This repo contains the code for the paper [On the Conversational Persuasiveness of Large Language Models](https://arxiv.org/abs/2403.14380).

## Citation

Please cite our work as: 
```bibtex
@misc{salvi2024conversationalpersuasivenesslargelanguage,
      title={On the Conversational Persuasiveness of Large Language Models: A Randomized Controlled Trial}, 
      author={Francesco Salvi and Manoel Horta Ribeiro and Riccardo Gallotti and Robert West},
      year={2024},
      eprint={2403.14380},
      archivePrefix={arXiv},
      primaryClass={cs.CY},
      url={https://arxiv.org/abs/2403.14380}, 
}
```

## Getting Started
Before proceeding, make sure you have the following installed:
    
- Conda (https://docs.anaconda.com/miniconda/)
- R (https://cran.r-project.org/)

Then follow these steps:

1. Clone the repository

```bash
git clone --recurse-submodules git@github.com:epfl-dlab/debategpt.git
```

If you forgot to clone with `--recurse-submodules`, you can run the following command to get the submodules:

```bash
git submodule update --init --recursive
```

2. Initialize a new conda environment

```bash
conda env create -f debategpt.yml
```

3. Install required libraries

```bash
pip install -r requirements.txt
```

4. Run the following command to install the R kernel in your environment:

```bash
conda install -c r r-irkernel
```

5. Open R and run the following commands to install the necessary packages:

```R
install.packages("IRkernel")
IRkernel::installspec(user = TRUE)
install.packages("readr")
install.packages("MASS")
install.packages("ordinal")
install.packages("brant")
install.packages("broom")
install.packages("generalhoslem")
install.packages("boot")
```

6. Setup secrets
```bash
echo <your-openai-key> >> secrets/OPENAI_API_KEY.txt
```

## Repo Structure
The repo is structured as follows:

- `assets/`: stores the vector images generated for the paper.
- `data/`: stores the processed data used in the analysis.
- `debategpt/`: contains the code to recreate the experimental platform used in the paper to have people debate synchronously with other participants or with LLMs.
- `scripts/`: contains the code to process the data and run all the analyses presented in the paper.
	- `process_data.py`: processes the raw data and saves the processed data in the `data/` folder.
	- `regressionAnalysisR.ipynb`: runs the regression analysis using R. This notebook should be run in an R environment.
	- `analysis.py`: runs the analysis and generates the plots presented in the paper.
	- `extractLIWC.py`: extracts LIWC features from the data. Called in `process_data.py`.
	- `extractStrategies.py`: extracts persuasive strategies from the data. Called in `process_data.py`.
	- `extractTendimensions.py`: extracts underlying social dimensions from the data. Called in `process_data.py`.
