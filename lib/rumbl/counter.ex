defmodule Rumbl.Counter do
  def increment(pid), do: send(pid, :increment)

  def decrement(pid), do: send(pid, :decrement)

  def val(pid, timeout \\ 5000) do
    ref = make_ref()
    send(pid, {:val, self(), ref})
    receive do
      {^ref, val} -> val
    after timeout -> exit(:timeout)
    end
  end

  def start_link(initial_val) do
    {:ok, spawn_link(fn -> listen(initial_val) end )}
  end

  defp listen(val) do
    receive do
      :increment -> listen(val + 1)
      :decrement -> listen(val - 1)
      {:val, sender, ref} ->
        send sender, {ref, val}
        listen(val)
    end
  end
end
