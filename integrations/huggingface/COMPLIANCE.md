# HuggingFace Compliance

## Model licenses — review before production use

Each model has its own license. The table below covers the models registered in `HF_MODELS`:

| Model | License | Commercial use |
|---|---|---|
| microsoft/trocr-base-printed | MIT | Yes |
| microsoft/trocr-base-handwritten | MIT | Yes |
| flair/ner-multi | MIT | Yes |
| Helsinki-NLP/opus-mt-uk-en | Apache 2.0 | Yes |
| Helsinki-NLP/opus-mt-en-uk | Apache 2.0 | Yes |
| facebook/bart-large-mnli | MIT | Yes |
| google/vit-base-patch16-224 | Apache 2.0 | Yes |
| facebook/detr-resnet-50 | Apache 2.0 | Yes |
| nvidia/segformer-b0-finetuned-ade-512-512 | Apache 2.0 | Yes |

**Before adding a new model**: check its model card on https://huggingface.co/<model-id> for license terms. CC-BY-NC models **cannot** be used for commercial purposes.

## HuggingFace Inference API terms
- **Public API** (api-inference.huggingface.co): rate-limited; intended for development. Free tier: ~30,000 characters / month.
- **Inference Endpoints** (private, HF_ENDPOINT_URL): pay-per-use, no rate limits, data not used for training.
- **Terms**: https://huggingface.co/terms-of-service
- HuggingFace does not use API inputs to train models by default; confirm for any new plan tier.

## Self-hosted inference
- Using HF_ENDPOINT_URL pointing to a self-hosted inference server (e.g. TGI, vLLM, ONNX Runtime) means no data leaves the infrastructure.
- Self-hosted deployments still carry the model's own license obligations.
- The `isSelfHosted()` method returns `true` when HF_ENDPOINT_URL is set and does not point to HuggingFace servers.

## Key storage
- `HUGGINGFACE_API_KEY`: GitHub Actions secrets / server env. Never commit.
- `HF_ENDPOINT_URL`: server env. May contain auth tokens — treat as secret.
