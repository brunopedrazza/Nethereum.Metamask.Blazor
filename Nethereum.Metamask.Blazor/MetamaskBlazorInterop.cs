using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.JSInterop;
using Nethereum.JsonRpc.Client.RpcMessages;
using Newtonsoft.Json;

namespace Nethereum.Metamask.Blazor
{
    public class MetamaskBlazorInterop : IMetamaskInterop
    {
        private readonly IJSRuntime _jsRuntime;

        public MetamaskBlazorInterop(IJSRuntime jsRuntime)
        {
            _jsRuntime = jsRuntime;
        }

        public async ValueTask<string> OnConnectAsync()
        {
            return await _jsRuntime.InvokeAsync<string>("NethereumMetamaskInterop.OnConnect");
        }

        public async Task OnDisconnectAsync()
        {
            await _jsRuntime.InvokeVoidAsync("NethereumMetamaskInterop.OnDisconnect");
        }

        public async ValueTask<bool> IsProviderSelected()
        {
            return await _jsRuntime.InvokeAsync<bool>("NethereumMetamaskInterop.IsProviderSelected");
        }

        public async ValueTask<RpcResponseMessage> SendAsync(RpcRequestMessage rpcRequestMessage)
        {
            var response = await _jsRuntime.InvokeAsync<string>("NethereumMetamaskInterop.Request", JsonConvert.SerializeObject(rpcRequestMessage));
            return JsonConvert.DeserializeObject<RpcResponseMessage>(response);
        }

        public async ValueTask<RpcResponseMessage> SendTransactionAsync(MetamaskRpcRequestMessage rpcRequestMessage)
        {
            var response = await _jsRuntime.InvokeAsync<string>("NethereumMetamaskInterop.Request", JsonConvert.SerializeObject(rpcRequestMessage));
            return JsonConvert.DeserializeObject<RpcResponseMessage>(response);
        }

        public async ValueTask<string> SignAsync(string utf8Hex)
        {
            var result = await _jsRuntime.InvokeAsync<string>("NethereumMetamaskInterop.Sign", utf8Hex);
            return result.Trim('"');
        }

        public async ValueTask<string> GetSelectedAddress()
        {
            return await _jsRuntime.InvokeAsync<string>("NethereumMetamaskInterop.GetSelectedAddress");
        }


        [JSInvokable()]
        public static async Task ProviderSelectedChanged(bool available)
        {
            await MetamaskHostProvider.Current.ProviderSelectedChangedAsync(available);
        }

        [JSInvokable()]
        public static async Task SelectedAccountChanged(string selectedAccount)
        {
            await MetamaskHostProvider.Current.ChangeSelectedAccountAsync(selectedAccount);
        }
    }
}