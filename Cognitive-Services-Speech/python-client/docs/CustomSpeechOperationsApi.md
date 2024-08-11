# swagger_client.CustomSpeechOperationsApi

All URIs are relative to *https://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**operations_get_model_copy**](CustomSpeechOperationsApi.md#operations_get_model_copy) | **GET** /operations/models/copy/{id} | Gets the operation identified by the given ID.


# **operations_get_model_copy**
> Operation operations_get_model_copy(id)

Gets the operation identified by the given ID.

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# Configure API key authorization: api_key
configuration = swagger_client.Configuration()
configuration.api_key['Ocp-Apim-Subscription-Key'] = 'YOUR_API_KEY'
# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['Ocp-Apim-Subscription-Key'] = 'Bearer'
# Configure API key authorization: token
configuration = swagger_client.Configuration()
configuration.api_key['Authorization'] = 'YOUR_API_KEY'
# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['Authorization'] = 'Bearer'

# create an instance of the API class
api_instance = swagger_client.CustomSpeechOperationsApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | The identifier of the operation.

try:
    # Gets the operation identified by the given ID.
    api_response = api_instance.operations_get_model_copy(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling CustomSpeechOperationsApi->operations_get_model_copy: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | [**str**](.md)| The identifier of the operation. | 

### Return type

[**Operation**](Operation.md)

### Authorization

[api_key](../README.md#api_key), [token](../README.md#token)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

