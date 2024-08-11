# LanguageIdentificationProperties

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**mode** | [**LanguageIdentificationMode**](LanguageIdentificationMode.md) |  | [optional] 
**candidate_locales** | **list[str]** | The candidate locales for language identification (example [\&quot;en-US\&quot;, \&quot;de-DE\&quot;, \&quot;es-ES\&quot;]). A minimum of 2 and a maximum of 10 candidate locales, including the main locale for the transcription, is supported for continuous mode. For single language identification, the maximum number of candidate locales is unbounded. | 
**speech_model_mapping** | [**dict(str, EntityReference)**](EntityReference.md) | An optional mapping of locales to speech model entities. If no model is given for a locale, the default base model is used.  Keys must be locales contained in the candidate locales, values are entities for models of the respective locales. | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


