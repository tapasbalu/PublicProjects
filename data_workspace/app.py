import tempfile
import os
import streamlit as st
from dotenv import load_dotenv
import pandas as pd

from agents.data_engineer import get_cleaning_suggestions, auto_clean_data
from agents.data_analyst import ask_data_analyst

load_dotenv()

st.set_page_config(page_title="Data Workspace", page_icon="📊", layout="wide")

def main():
    st.title("🤖 Intelligent Data Analysis Workspace")
    st.markdown("Upload a CSV file to let the AI analyze, clean, and visualize your data.")

    # Sidebar for API keys and Configuration
    with st.sidebar:
        st.header("⚙️ Configuration")
        google_api_key = st.text_input("Google AI API Key", type="password")
        if google_api_key:
            os.environ["GOOGLE_API_KEY"] = google_api_key
        else:
            st.warning("Please enter your Google API key to proceed.")
            
        st.divider()
        st.markdown("### Agents Online 🟢")
        st.markdown("- 🛠️ **Data Engineer**: Profiling & Cleaning")
        st.markdown("- 📈 **Data Analyst**: Q&A & Insights")

    # Main Content Area
    uploaded_file = st.file_uploader("Choose a CSV file", type=["csv"])

    if uploaded_file is not None:
        try:
            # We use session state to persist the dataframe across reruns
            if "df" not in st.session_state:
                st.session_state.df = pd.read_csv(uploaded_file)
            
            df = st.session_state.df
            
            # --- TABS FOR WORKFLOW ---
            tab1, tab2, tab3 = st.tabs(["📄 Raw Data", "🛠️ Data Engineer", "📈 Data Analyst"])
            
            with tab1:
                st.subheader("Data Preview")
                st.dataframe(df.head())
                st.write(f"**Shape:** {df.shape[0]} rows, {df.shape[1]} columns")
                
            with tab2:
                st.header("Data Engineering & Cleaning")
                if st.button("🔍 Profile Data & Get Suggestions"):
                    if not google_api_key:
                        st.error("Please add your Google API Key in the sidebar first.")
                    else:
                        with st.spinner("Data Engineer is analyzing your dataset..."):
                            suggestions = get_cleaning_suggestions(df, google_api_key)
                            st.markdown("### 🤖 Engineer's Notes:")
                            st.info(suggestions)
                            
                if st.button("✨ Auto-Clean Data"):
                    with st.spinner("Cleaning data..."):
                        cleaned_df = auto_clean_data(df)
                        st.session_state.df = cleaned_df
                        st.success("Data cleaned successfully! (Nulls dropped, missing values imputed).")
                        st.dataframe(cleaned_df.head())

            with tab3:
                st.header("Ask the Data Analyst")
                st.markdown("Ask natural language questions about your dataset (e.g., 'What is the sum of column X?').")
                
                # Chat Interface
                if "messages" not in st.session_state:
                    st.session_state.messages = []

                # Display chat messages from history on app rerun
                for message in st.session_state.messages:
                    with st.chat_message(message["role"]):
                        st.markdown(message["content"])

                # React to user input
                if prompt := st.chat_input("Ask a question about your data..."):
                    if not google_api_key:
                        st.error("Please add your Google API Key in the sidebar first.")
                    else:
                        # Display user message in chat message container
                        st.chat_message("user").markdown(prompt)
                        # Add user message to chat history
                        st.session_state.messages.append({"role": "user", "content": prompt})

                        with st.chat_message("assistant"):
                            with st.spinner("Thinking..."):
                                response = ask_data_analyst(df, prompt, google_api_key)
                                st.markdown(response)
                        # Add assistant response to chat history
                        st.session_state.messages.append({"role": "assistant", "content": response})

        except Exception as e:
            st.error(f"Error reading or processing the file: {e}")
    else:
        st.info("Awaiting file upload...")

if __name__ == "__main__":
    main()
