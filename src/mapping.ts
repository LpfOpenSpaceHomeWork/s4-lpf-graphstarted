import { NFTCreated as NFTCreatedEvent } from "../generated/NFTFactory/NFTFactory";
import { CreatedNFT } from "../generated/schema";
import { NFT } from "../generated/templates";
import { ByteArray, crypto } from "@graphprotocol/graph-ts";
import { TokenInfo } from "../generated/schema";
import { Transfer as TokenTransferEvent } from "./../generated/templates/NFT/NFT";

export function handleNFTCreated(event: NFTCreatedEvent): void {
  // 实例化NFT合约数据源
  NFT.create(event.params.nftCA);
  // 在store中创建NFT实体
  const nftEntity = new CreatedNFT(event.params.nftCA.toHexString()); // 直接用合约地址做ID
  nftEntity.nftCA = event.params.nftCA;

  nftEntity.blockNumber = event.block.number;
  nftEntity.blockTimestamp = event.block.timestamp;
  nftEntity.transactionHash = event.transaction.hash;

  nftEntity.save();
}

export function handleTokenTransfer(event: TokenTransferEvent): void {
  const nftCA = event.address;
  const tokenID = event.params.tokenId;
  const nftCAByteArray = ByteArray.fromHexString(nftCA.toHexString());
  const tokenIDByteArray = ByteArray.fromBigInt(tokenID);
  const tokenEntityID = crypto.keccak256(
    nftCAByteArray.concat(tokenIDByteArray)
  );
  let tokenEntity = TokenInfo.load(tokenEntityID.toHexString());
  if (!tokenEntity) {
    tokenEntity = new TokenInfo(tokenEntityID.toHexString());
    tokenEntity.blockNumber = event.block.number;
    tokenEntity.blockTimestamp = event.block.timestamp;
    tokenEntity.transactionHash = event.transaction.hash;
  }
  tokenEntity.ca = nftCA;
  tokenEntity.tokenId = tokenID;
  tokenEntity.owner = event.params.to;
  tokenEntity.save();
}
