import pandas as pd
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent

def ask_data_analyst(df: pd.DataFrame, question: str, api_key: str) -> str:
    """Uses a LangChain Pandas agent to answer a question about the dataframe."""
    try:
        # We use gpt-4o as the analyst since writing code requires higher reasoning
        llm = ChatGoogleGenerativeAI(temperature=0, google_api_key=api_key, model="gemini-2.5-flash")
        
        # create_pandas_dataframe_agent runs Python code under the hood to answer questions.
        # allow_dangerous_code=True is required by newer versions of langchain-experimental.
        agent = create_pandas_dataframe_agent(
            llm, 
            df, 
            verbose=True, 
            allow_dangerous_code=True,
            agent_type="openai-tools"
        )
        
        response = agent.invoke(question)
        return response["output"]
        
    except Exception as e:
        return f"Error executing Data Analyst agent: {e}"
