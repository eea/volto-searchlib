import json
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class StreamedResponse:
    """Holds the accumulated streamed response chunks."""
    user_message_id: Optional[int] = None
    assistant_message_id: Optional[int] = None
    chunks: list[dict] = field(default_factory=list)
    grouped_chunks: dict[int, list[dict]] = field(default_factory=dict)
    stopped: bool = False
    error: Optional[str] = None

    def get_by_ind(self, ind: int) -> list[dict]:
        """Get all chunks for a specific ind value."""
        return self.grouped_chunks.get(ind, [])

    def get_by_type(self, chunk_type: str, ind: Optional[int] = None) -> list[dict]:
        """Get all chunks of a specific type, optionally filtered by ind."""
        if ind is not None:
            chunks = self.get_by_ind(ind)
        else:
            chunks = self.chunks

        return [
            c["obj"] for c in chunks
            if c.get("obj", {}).get("type") == chunk_type
        ]

    def get_message(self) -> str:
        """Concatenate all message_delta chunks into final message."""
        return "".join(
            c.get("content", "") for c in self.get_by_type("message_delta")
        )

    @classmethod
    def from_jsonl_body(cls, body: str) -> "StreamedResponse":
        """Parse JSONL body into a StreamedResponse."""
        chunks = []
        grouped = {}
        user_msg_id = None
        assistant_msg_id = None
        error = None
        stopped = False
        
        for line in body.strip().split('\n'):
            if not line:
                continue
            try:
                chunk = json.loads(line)
            except json.JSONDecodeError:
                continue

            if "user_message_id" in chunk and "reserved_assistant_message_id" in chunk:
                user_msg_id = chunk.get("user_message_id")
                assistant_msg_id = chunk.get("reserved_assistant_message_id")
                chunk = {
                    "ind": -1,
                    "obj": {
                        "type": "ids_info",
                        "user_msg_id": user_msg_id,
                        "assistant_msg_id": assistant_msg_id,
                    },
                }
            if "error" in chunk:
                error = chunk.get("error")
                chunk = {
                    "ind": -1,
                    "obj": {
                        "type": "error",
                        "error": error
                    },
                }
            
            chunks.append(chunk)
            if "ind" in chunk:
                ind = chunk["ind"]
                if "obj" in chunk and chunk["obj"].get("type") == "stop":
                    stopped = True
                if ind not in grouped:
                    grouped[ind] = []
                grouped[ind].append(chunk)

        return cls(
            user_message_id=user_msg_id,
            assistant_message_id=assistant_msg_id,
            chunks=chunks,
            grouped_chunks=grouped,
            stopped=stopped,
            error=error
        )
