"""
ReadOnlyAgent - A specialized version of CodeActAgent that only uses read-only tools.
"""

import os
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from litellm import ChatCompletionToolParam

    from openhands.events.action import Action
    from openhands.llm.llm import ModelResponse

from openhands.agenthub.codeact_agent.codeact_agent import CodeActAgent
from openhands.agenthub.readonly_agent import (
    function_calling as readonly_function_calling,
)
from openhands.core.config import AgentConfig
from openhands.core.logger import openhands_logger as logger
from openhands.llm.llm import LLM
from openhands.utils.prompt import PromptManager


class ReadOnlyAgent(CodeActAgent):
    VERSION = '1.0'
    """
    The ReadOnlyAgent is a specialized version of CodeActAgent that only uses read-only tools.

    This agent is designed for safely exploring codebases without making any changes.
    It only has access to tools that don't modify the system: grep, glob, view, think, finish, web_read.

    Use this agent when you want to:
    1. Explore a codebase to understand its structure
    2. Search for specific patterns or code
    3. Research without making any changes

    When you're ready to make changes, switch to the regular CodeActAgent.
    """

    def __init__(
        self,
        llm: LLM,
        config: AgentConfig,
        workspace_root: str | None,
    ) -> None:
        """Initializes a new instance of the ReadOnlyAgent class."""
        super().__init__(llm, config, workspace_root=workspace_root)
        # self.tools are set by the parent CodeActAgent's __init__ which calls _get_tools.
        # This class overrides _get_tools to provide its specific read-only tools.

    @property
    def prompt_manager(self) -> PromptManager:
        # Set up our own prompt manager
        if self._prompt_manager is None:
            self._prompt_manager = PromptManager(
                prompt_dir=os.path.join(os.path.dirname(__file__), 'prompts'),
            )
        return self._prompt_manager

    def _get_tools(self) -> list['ChatCompletionToolParam']:
        # Override the tools to only include read-only tools
        # Get the read-only tools from our own function_calling module
        return readonly_function_calling.get_tools()

    def set_mcp_tools(self, mcp_tools: list[dict]) -> None:
        """Sets the list of MCP tools for the agent.

        Args:
        - mcp_tools (list[dict]): The list of MCP tools.
        """
        logger.warning(
            'ReadOnlyAgent does not support MCP tools. MCP tools will be ignored by the agent.'
        )

    def response_to_actions(self, response: 'ModelResponse') -> list['Action']:
        return readonly_function_calling.response_to_actions(
            response, mcp_tool_names=list(self.mcp_tools.keys())
        )
