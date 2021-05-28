using System.Threading.Tasks;
using Nethereum.JsonRpc.Client.RpcMessages;

namespace Nethereum.Metamask
{
    public interface IMetamaskInterop
    {
        ValueTask<string> OnConnectAsync();
        Task OnDisconnectAsync();
        ValueTask<bool> IsProviderSelected();
        ValueTask<string> GetSelectedAddress();
        ValueTask<RpcResponseMessage> SendAsync(RpcRequestMessage rpcRequestMessage);
        ValueTask<RpcResponseMessage> SendTransactionAsync(MetamaskRpcRequestMessage rpcRequestMessage);
        ValueTask<string> SignAsync(string utf8Hex);
    }
}