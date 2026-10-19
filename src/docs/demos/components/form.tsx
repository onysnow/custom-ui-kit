import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@onysnow/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@onysnow/ui/form";
import { Input } from "@onysnow/ui/input";

const schema = z.object({ username: z.string().min(3, "At least 3 characters") });

export default function FormDemo() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { username: "" },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})} className="w-full max-w-sm space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="onysnow" {...field} />
              </FormControl>
              <FormDescription>Shown on your public profile.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
