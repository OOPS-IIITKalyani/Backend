import pandas as pd
import json

adj_matrix = pd.read_csv('adjacency_matrix_adult_diseases.csv')

symptom_disease = {}

for symptom in adj_matrix.sum()[adj_matrix.sum() == 1].index:
    disease = adj_matrix.loc[adj_matrix[symptom] == 1].iloc[0, 0]
    symptom_disease[symptom] = disease

symptom_disease_json = json.dumps(symptom_disease, indent=4)
print(symptom_disease_json)

with open('symptom_disease.json', 'w') as f:
    f.write(symptom_disease_json)