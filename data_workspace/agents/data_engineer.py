import pandas as pd
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

def profile_data(df: pd.DataFrame) -> dict:
    """Analyze the dataframe and return a summary profile."""
    profile = {
        "num_rows": df.shape[0],
        "num_cols": df.shape[1],
        "columns": list(df.columns),
        "missing_values": df.isnull().sum().to_dict(),
        "data_types": df.dtypes.astype(str).to_dict()
    }
    return profile

def get_cleaning_suggestions(df: pd.DataFrame, api_key: str) -> str:
    """Uses an LLM to suggest how to clean the data based on its profile."""
    profile = profile_data(df)
    
    # We only pass a summary of the data, not the whole dataframe, to save tokens/context
    summary_str = f"Dataset Shape: {profile['num_rows']} rows, {profile['num_cols']} columns.\n"
    summary_str += f"Columns and Data Types: {profile['data_types']}\n"
    summary_str += f"Missing Values per Column: {profile['missing_values']}\n"
    
    prompt = PromptTemplate(
        input_variables=["data_summary"],
        template="You are a Data Engineer. Review the following dataset profile and provide 3-5 concise, actionable bullet points on how to clean or preprocess this data for analysis.\n\nProfile:\n{data_summary}\n\nSuggestions:"
    )
    
    try:
        llm = ChatGoogleGenerativeAI(temperature=0, google_api_key=api_key, model="gemini-2.5-flash")
        chain = prompt | llm
        response = chain.invoke({"data_summary": summary_str})
        return response.content
    except Exception as e:
        return f"Error connecting to LLM for suggestions: {e}"

def auto_clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """A simple utility to perform basic automated cleaning."""
    # Create a copy so we don't mutate the original if not desired
    clean_df = df.copy()
    
    # Drop rows where ALL elements are missing
    clean_df.dropna(how='all', inplace=True)
    
    # Fill numeric columns with their mean
    numeric_cols = clean_df.select_dtypes(include=['number']).columns
    for col in numeric_cols:
         if clean_df[col].isnull().any():
             clean_df[col].fillna(clean_df[col].mean(), inplace=True)
             
    # Fill categorical/object columns with 'Unknown'
    cat_cols = clean_df.select_dtypes(include=['object']).columns
    for col in cat_cols:
         if clean_df[col].isnull().any():
             clean_df[col].fillna('Unknown', inplace=True)
             
    return clean_df
